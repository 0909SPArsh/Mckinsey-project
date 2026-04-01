import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { solveCaseWithContext } from '@/lib/gemini';
import type { ClarifyingAnswer, Phase1Result } from '@/types/case';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, clarifyingAnswers } = body as {
      sessionId: string;
      clarifyingAnswers: ClarifyingAnswer[];
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Fetch session from Supabase
    let phase1: Phase1Result | null = null;
    let fileUrl = '';

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
        fileUrl = session.file_url || '';
      }
    } catch (dbErr) {
      console.error('Database error:', dbErr);
    }

    if (!phase1) {
      return NextResponse.json(
        { error: 'Session not found or missing context' },
        { status: 404 }
      );
    }

    // Re-fetch PDF from Supabase Storage as base64
    let base64PDF = '';

    if (fileUrl) {
      try {
        // Extract the file path from the public URL
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

    if (!base64PDF) {
      // If we can't get the PDF, we'll solve without it (text-only from phase1 context)
      return NextResponse.json(
        { error: 'Could not retrieve the original PDF. Please re-upload.' },
        { status: 400 }
      );
    }

    // Call Gemini Phase 2
    const solution = await solveCaseWithContext(base64PDF, phase1, clarifyingAnswers || []);

    // Update session in Supabase
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
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
