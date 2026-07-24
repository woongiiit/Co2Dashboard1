import { getHuggingfaceConfig } from "@/lib/huggingface/config";
import { parseAiConsultingInsightResponse } from "@/lib/huggingface/parse-ai-consulting-insight-response";
import {
  resolveAiConsultingSystemPrompt,
  resolveAiConsultingUserPrompt,
  type AiConsultingInsightContext,
} from "@/lib/ai-consulting/build-ai-consulting-insight-context";
import type { AiConsultingInsightsSections } from "@/lib/ai-consulting/types";
import { searchTourismWebContext } from "@/lib/web-search/search-tourism-context";

export type GenerateAiConsultingInsightsResult = {
  sections: AiConsultingInsightsSections;
  source: "huggingface" | "fallback";
  model?: string;
  warning?: string;
  webSearchWarning?: string;
};

type ChatMessage = {
  content?: string | null;
  reasoning_content?: string | null;
};

type ChatCompletionResponse = {
  choices?: Array<{ finish_reason?: string; message?: ChatMessage }>;
  error?: { message?: string };
};

function extractAssistantText(message: ChatMessage | undefined): string {
  if (!message) return "";
  const content = message.content?.trim();
  if (content) return content;
  const reasoning = message.reasoning_content?.trim();
  if (!reasoning) return "";
  const jsonMatch = reasoning.match(/\{[\s\S]*\}\s*$/);
  if (jsonMatch) return jsonMatch[0].trim();
  return reasoning;
}

function logAiConsultingWebSearch(
  stage: string,
  payload: Record<string, unknown>,
): void {
  console.info(`[ai-consulting:web-search] ${stage}`, payload);
}

async function enrichContextWithWebSearch(
  context: AiConsultingInsightContext,
): Promise<AiConsultingInsightContext> {
  if (context.scope === "national") {
    logAiConsultingWebSearch("skipped", {
      reason: "national_scope",
      regionLabel: context.regionLabel,
      scope: context.scope,
    });
    return context;
  }
  if (context.webTourism && context.webTourism.snippets.length > 0) {
    logAiConsultingWebSearch("reused_existing", {
      regionLabel: context.regionLabel,
      scope: context.scope,
      snippetCount: context.webTourism.snippets.length,
      placeNames: context.webTourism.placeNames,
      sources: [...new Set(context.webTourism.snippets.map((item) => item.source))],
      warning: context.webTourism.warning ?? null,
    });
    return context;
  }

  try {
    const startedAt = Date.now();
    const webTourism = await searchTourismWebContext(context.regionLabel);
    logAiConsultingWebSearch("completed", {
      regionLabel: context.regionLabel,
      scope: context.scope,
      elapsedMs: Date.now() - startedAt,
      queryCount: webTourism.queries.length,
      queries: webTourism.queries,
      snippetCount: webTourism.snippets.length,
      placeNames: webTourism.placeNames,
      titles: webTourism.snippets.map((item) => item.title),
      sources: [...new Set(webTourism.snippets.map((item) => item.source))],
      warning: webTourism.warning ?? null,
      passedToPrompt: webTourism.snippets.length > 0,
    });
    return { ...context, webTourism };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown web search error";
    logAiConsultingWebSearch("failed", {
      regionLabel: context.regionLabel,
      scope: context.scope,
      error: message,
      passedToPrompt: false,
    });
    return {
      ...context,
      webTourism: {
        regionLabel: context.regionLabel,
        queries: [],
        snippets: [],
        placeNames: [],
        warning: "웹 검색에 실패해 엑셀 데이터만으로 생성합니다.",
      },
    };
  }
}

export async function generateAiConsultingInsightsWithHf(
  context: AiConsultingInsightContext,
  fallbackSections: AiConsultingInsightsSections,
): Promise<GenerateAiConsultingInsightsResult> {
  const config = getHuggingfaceConfig();
  const enriched = await enrichContextWithWebSearch(context);
  const webSearchWarning = enriched.webTourism?.warning;
  const webTourism = enriched.webTourism;
  const snippetCount = webTourism?.snippets.length ?? 0;

  if (!config.enabled || !config.apiKey) {
    logAiConsultingWebSearch("llm_skipped", {
      reason: "missing_huggingface_api_key",
      regionLabel: enriched.regionLabel,
      snippetCount,
      injectedIntoPrompt: false,
    });
    return {
      sections: fallbackSections,
      source: "fallback",
      warning: "HUGGINGFACE_API_KEY가 설정되지 않아 규칙 기반 제언을 표시합니다.",
      webSearchWarning,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);
    const systemPrompt = resolveAiConsultingSystemPrompt(enriched);
    const userPrompt = resolveAiConsultingUserPrompt(enriched);
    const webBlockInjected =
      userPrompt.includes("## 웹 검색 관광 맥락") && snippetCount > 0;

    logAiConsultingWebSearch("llm_request", {
      regionLabel: enriched.regionLabel,
      scope: enriched.scope,
      model: config.model,
      snippetCount,
      placeNames: webTourism?.placeNames ?? [],
      sources: [
        ...new Set(webTourism?.snippets.map((item) => item.source) ?? []),
      ],
      warning: webSearchWarning ?? null,
      injectedIntoPrompt: webBlockInjected,
      userPromptChars: userPrompt.length,
      systemPromptChars: systemPrompt.length,
    });

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: Math.max(config.maxTokens, 2000),
        temperature: config.temperature,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const payload = (await response.json()) as ChatCompletionResponse;
    if (!response.ok) {
      throw new Error(
        payload.error?.message ?? `Hugging Face API 오류 (${response.status})`,
      );
    }

    const content = extractAssistantText(payload.choices?.[0]?.message);
    if (!content) {
      throw new Error("모델 응답이 비어 있습니다.");
    }

    const parsed = parseAiConsultingInsightResponse(content);
    if (!parsed) {
      throw new Error("모델 응답을 AI 컨설팅 섹션으로 해석하지 못했습니다.");
    }

    const sections = mergeAiConsultingSections(parsed, fallbackSections);

    logAiConsultingWebSearch("llm_success", {
      regionLabel: enriched.regionLabel,
      model: config.model,
      injectedIntoPrompt: webBlockInjected,
      snippetCount,
    });

    return {
      sections,
      source: "huggingface",
      model: config.model,
      webSearchWarning,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 컨설팅 생성에 실패했습니다.";
    logAiConsultingWebSearch("llm_fallback", {
      regionLabel: enriched.regionLabel,
      model: config.model,
      error: message,
      snippetCount,
      warning: webSearchWarning ?? null,
    });
    return {
      sections: fallbackSections,
      source: "fallback",
      model: config.model,
      warning: `${message} 규칙 기반 제언을 표시합니다.`,
      webSearchWarning,
    };
  }
}

function mergeAiConsultingSections(
  parsed: AiConsultingInsightsSections,
  fallback: AiConsultingInsightsSections,
): AiConsultingInsightsSections {
  return {
    regionalEvaluation:
      parsed.regionalEvaluation.length > 0
        ? parsed.regionalEvaluation
        : fallback.regionalEvaluation,
    travelerGuide:
      parsed.travelerGuide.length >= 3
        ? parsed.travelerGuide
        : fallback.travelerGuide,
    governmentConsulting:
      parsed.governmentConsulting.length > 0
        ? parsed.governmentConsulting
        : fallback.governmentConsulting,
    priorityActions: {
      short:
        parsed.priorityActions.short.length > 0
          ? parsed.priorityActions.short
          : fallback.priorityActions.short,
      mid:
        parsed.priorityActions.mid.length > 0
          ? parsed.priorityActions.mid
          : fallback.priorityActions.mid,
      long:
        parsed.priorityActions.long.length > 0
          ? parsed.priorityActions.long
          : fallback.priorityActions.long,
    },
    oneLineRecommendation:
      parsed.oneLineRecommendation.length >= 40
        ? parsed.oneLineRecommendation
        : fallback.oneLineRecommendation,
  };
}
