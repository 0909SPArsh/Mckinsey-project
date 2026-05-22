import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { solveCaseWithContext } from '@/lib/gemini';
import { getSession, updateSession } from '@/lib/sessionStore';
import type { ClarifyingAnswer, Phase1Result } from '@/types/case';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Auth guard — verify user is authenticated
    let user = null;
    try {
      const supabase = await createClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth getUser error:', authError.message);
      }
      user = data?.user ?? null;
    } catch (authErr) {
      console.error('Auth guard exception:', authErr);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sessionId, clarifyingAnswers } = body as {
      sessionId: string;
      clarifyingAnswers: ClarifyingAnswer[];
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    let phase1: Phase1Result | null = null;
    let base64PDF = '';

    // ---- Try in-memory store first (always available) ----
    const memSession = getSession(sessionId);
    if (memSession) {
      phase1 = memSession.phase1;
      base64PDF = memSession.base64PDF;
    }

    // ---- Fallback to Supabase if memory miss ----
    if (!phase1) {
      try {
        const { data: session, error } = await getSupabaseAdmin()
          .from('case_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) {
          console.error('Session fetch error:', error);
        } else if (session) {
          phase1 = session.raw_context as Phase1Result;

          // Re-fetch PDF from Supabase Storage as base64
          const fileUrl = session.file_url || '';
          if (fileUrl) {
            try {
              const urlParts = fileUrl.split('/case-pdfs/');
              const filePath = urlParts[urlParts.length - 1];

              const { data: fileData, error: downloadError } = await getSupabaseAdmin().storage
                .from('case-pdfs')
                .download(filePath);

              if (downloadError) {
                console.error('File download error:', downloadError);
              } else if (fileData) {
                const arrayBuffer = await fileData.arrayBuffer();
                base64PDF = Buffer.from(arrayBuffer).toString('base64');
              }
            } catch (downloadErr) {
              console.error('Download error:', downloadErr);
            }
          }
        }
      } catch (dbErr) {
        console.error('Database error (Supabase may not be configured):', dbErr);
      }
    }

    if (!phase1) {
      return NextResponse.json(
        { error: 'Session not found or missing context. Please re-upload the case.' },
        { status: 404 }
      );
    }

    if (!base64PDF) {
      return NextResponse.json(
        { error: 'Could not retrieve the original PDF. Please re-upload.' },
        { status: 400 }
      );
    }

    // Call Gemini Phase 2
    const solution = await solveCaseWithContext(base64PDF, phase1, clarifyingAnswers || []);

    // Update in-memory store
    updateSession(sessionId, { answers: clarifyingAnswers, solution });

    // Try updating Supabase (non-fatal if it fails)
    try {
      await getSupabaseAdmin()
        .from('case_sessions')
        .update({
          clarifying_questions: clarifyingAnswers,
          solution,
          status: 'solved',
        })
        .eq('id', sessionId);
    } catch (dbErr) {
      console.error('DB update error (non-fatal):', dbErr);
    }

    return NextResponse.json({ solution });
  } catch (error) {
    console.error('Clarify error:', error);

    // Only expose user-friendly GeminiUserError messages to the client
    const isGeminiError = error instanceof Error && error.name === 'GeminiUserError';
    const statusCode = isGeminiError && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500;
    const message = isGeminiError
      ? (error as Error).message
      : 'An unexpected error occurred while solving the case. Please try again.';

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
