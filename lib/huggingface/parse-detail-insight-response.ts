import type { RegionDetailInsightsSections } from "@/lib/region-excel/types";

export function parseDetailInsightResponse(
  raw: string,
): RegionDetailInsightsSections | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const jsonCandidate = extractJsonObject(trimmed);
  if (jsonCandidate) {
    const parsed = tryParseDetailSections(jsonCandidate);
    if (parsed) return parsed;
  }

  return null;
}

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return null;
}

function tryParseDetailSections(
  jsonText: string,
): RegionDetailInsightsSections | null {
  try {
    const value = JSON.parse(jsonText) as Record<string, unknown>;
    const evaluation = normalizeSection(value.evaluation);
    const traveler = normalizeSection(value.traveler);
    const policy = normalizeSection(value.policy);

    if (evaluation.length === 0 && traveler.length === 0 && policy.length === 0) {
      return null;
    }

    return { evaluation, traveler, policy };
  } catch {
    return null;
  }
}

function normalizeSection(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length >= 8)
    .slice(0, 3);
}
