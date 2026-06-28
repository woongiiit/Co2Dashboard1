import { getHuggingfaceConfig } from "@/lib/huggingface/config";
import { parseAiConsultingInsightResponse } from "@/lib/huggingface/parse-ai-consulting-insight-response";
import {
  resolveAiConsultingSystemPrompt,
  resolveAiConsultingUserPrompt,
  type AiConsultingInsightContext,
} from "@/lib/ai-consulting/build-ai-consulting-insight-context";
import type { AiConsultingInsightsSections } from "@/lib/ai-consulting/types";

export type GenerateAiConsultingInsightsResult = {
  sections: AiConsultingInsightsSections;
  source: "huggingface" | "fallback";
  model?: string;
  warning?: string;
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

export async function generateAiConsultingInsightsWithHf(
  context: AiConsultingInsightContext,
  fallbackSections: AiConsultingInsightsSections,
): Promise<GenerateAiConsultingInsightsResult> {
  const config = getHuggingfaceConfig();

  if (!config.enabled || !config.apiKey) {
    return {
      sections: fallbackSections,
      source: "fallback",
      warning: "HUGGINGFACE_API_KEY가 설정되지 않아 규칙 기반 제언을 표시합니다.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: resolveAiConsultingSystemPrompt(context) },
          { role: "user", content: resolveAiConsultingUserPrompt(context) },
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

    return { sections, source: "huggingface", model: config.model };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 컨설팅 생성에 실패했습니다.";
    return {
      sections: fallbackSections,
      source: "fallback",
      model: config.model,
      warning: `${message} 규칙 기반 제언을 표시합니다.`,
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
