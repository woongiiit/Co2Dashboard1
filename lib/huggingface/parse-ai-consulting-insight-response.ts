import type {
  AiConsultingInsightsSections,
  TravelerGuideItem,
} from "@/lib/ai-consulting/types";

const TRAVELER_IDS: TravelerGuideItem["id"][] = [
  "transport",
  "lodging",
  "food",
  "waste",
  "activity",
];

export function parseAiConsultingInsightResponse(
  raw: string,
): AiConsultingInsightsSections | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const jsonCandidate = extractJsonObject(trimmed);
  if (!jsonCandidate) return null;

  try {
    const value = JSON.parse(jsonCandidate) as Record<string, unknown>;
    const regionalEvaluation = normalizeStrings(value.regionalEvaluation, 4, 12);
    const governmentConsulting = normalizeStrings(value.governmentConsulting, 6, 12);
    const oneLineRecommendation =
      typeof value.oneLineRecommendation === "string"
        ? value.oneLineRecommendation.trim()
        : "";

    const travelerGuide = parseTravelerGuide(value.travelerGuide);
    const priorityActions = parsePriorityActions(value.priorityActions);

    if (
      regionalEvaluation.length === 0 &&
      governmentConsulting.length === 0 &&
      !oneLineRecommendation
    ) {
      return null;
    }

    return {
      regionalEvaluation,
      travelerGuide,
      governmentConsulting,
      priorityActions,
      oneLineRecommendation,
    };
  } catch {
    return null;
  }
}

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return null;
}

function normalizeStrings(
  value: unknown,
  maxItems: number,
  minLength: number,
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length >= minLength)
    .slice(0, maxItems);
}

function parseTravelerGuide(value: unknown): TravelerGuideItem[] {
  if (!Array.isArray(value)) return [];

  const byId = new Map<string, TravelerGuideItem>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const id = record.id;
    if (typeof id !== "string" || !TRAVELER_IDS.includes(id as TravelerGuideItem["id"])) {
      continue;
    }
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const description =
      typeof record.description === "string" ? record.description.trim() : "";
    if (title.length < 2 || description.length < 12) continue;

    byId.set(id, {
      id: id as TravelerGuideItem["id"],
      title,
      description,
    });
  }

  return TRAVELER_IDS.map((id) => byId.get(id)).filter(
    (item): item is TravelerGuideItem => item != null,
  );
}

function parsePriorityActions(value: unknown): AiConsultingInsightsSections["priorityActions"] {
  const empty = { short: [] as string[], mid: [] as string[], long: [] as string[] };
  if (!value || typeof value !== "object") return empty;

  const record = value as Record<string, unknown>;
  return {
    short: normalizeStrings(record.short, 3, 8),
    mid: normalizeStrings(record.mid, 3, 8),
    long: normalizeStrings(record.long, 3, 8),
  };
}
