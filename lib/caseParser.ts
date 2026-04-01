/**
 * Parse a JSON response from Gemini.
 * Handles edge cases: markdown code fences, leading/trailing text, etc.
 */
export function parseJsonResponse<T>(raw: string): T | null {
  // Strip markdown code fences if present
  let cleaned = raw.trim();

  // Remove ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to find the first { ... } block
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
