export function parseInsightResponse(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const jsonCandidate = extractJsonArray(trimmed);
  if (jsonCandidate) {
    const parsed = tryParseInsightArray(jsonCandidate);
    if (parsed.length > 0) return parsed;
  }

  return trimmed
    .split(/\n+/)
    .map((line) => line.replace(/^[\s\-*•\d.)、]+/, "").trim())
    .filter((line) => line.length >= 12)
    .slice(0, 5);
}

function extractJsonArray(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return null;
}

function tryParseInsightArray(jsonText: string): string[] {
  try {
    const value = JSON.parse(jsonText) as unknown;
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length >= 12)
      .slice(0, 5);
  } catch {
    return [];
  }
}
