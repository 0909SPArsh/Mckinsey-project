import type { Phase1Result, Phase2Solution, ClarifyingAnswer } from '@/types/case';

/**
 * In-memory session store — used as a fallback when Supabase is
 * not configured. Keeps session data alive for the lifetime of
 * the Next.js server process (survives hot-reloads in dev).
 */

interface SessionData {
  id: string;
  fileName: string;
  base64PDF: string;
  phase1: Phase1Result;
  answers?: ClarifyingAnswer[];
  solution?: Phase2Solution;
  createdAt: number;
}

// Module-level Map persists across requests (but not across restarts)
const sessions = new Map<string, SessionData>();

// Auto-clean sessions older than 2 hours every 10 minutes
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

setInterval(cleanup, 10 * 60 * 1000);

export function storeSession(
  id: string,
  fileName: string,
  base64PDF: string,
  phase1: Phase1Result
) {
  sessions.set(id, {
    id,
    fileName,
    base64PDF,
    phase1,
    createdAt: Date.now(),
  });
}

export function getSession(id: string): SessionData | undefined {
  return sessions.get(id);
}

export function updateSession(
  id: string,
  updates: Partial<Pick<SessionData, 'answers' | 'solution'>>
) {
  const session = sessions.get(id);
  if (session) {
    Object.assign(session, updates);
  }
}
