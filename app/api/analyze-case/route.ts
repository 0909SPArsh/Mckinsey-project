import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { analyzeCase } from '@/lib/gemini';
import { storeSession } from '@/lib/sessionStore';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 120; // Allow up to 120s for Gemini processing
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    // Validate file size (15MB max)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be under 15MB' }, { status: 400 });
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64PDF = buffer.toString('base64');

    // Upload to Supabase Storage
    const fileName = `${uuidv4()}-${file.name}`;
    let fileUrl = '';

    try {
      const { data: uploadData, error: uploadError } = await getSupabaseAdmin().storage
        .from('case-pdfs')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        // Continue without storage — Gemini analysis still works
      } else {
        const { data: urlData } = getSupabaseAdmin().storage
          .from('case-pdfs')
          .getPublicUrl(uploadData.path);
        fileUrl = urlData.publicUrl;
      }
    } catch (storageErr) {
      console.error('Storage error (non-fatal):', storageErr);
    }

    // Call Gemini Phase 1
    const phase1 = await analyzeCase(base64PDF);

    // Store in memory for Phase 2 (works even without Supabase)
    const memorySessionId = uuidv4();
    storeSession(memorySessionId, file.name, base64PDF, phase1);

    // Create session in Supabase
    let sessionId = memorySessionId;

    try {
      const { data: sessionData, error: dbError } = await getSupabaseAdmin()
        .from('case_sessions')
        .insert({
          id: sessionId,
          file_name: file.name,
          file_url: fileUrl,
          case_type: phase1.case_type,
          raw_context: phase1,
          clarifying_questions: phase1.clarifying_questions,
          status: 'clarifying',
        })
        .select()
        .single();

      if (dbError) {
        console.error('DB insert error:', dbError);
        // Continue with local session ID
      } else if (sessionData) {
        sessionId = sessionData.id;
      }
    } catch (dbErr) {
      console.error('Database error (non-fatal):', dbErr);
    }

    return NextResponse.json({
      sessionId,
      phase1,
    });
  } catch (error) {
    console.error('Analyze case error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
