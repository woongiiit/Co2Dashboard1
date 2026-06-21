import { getHuggingfaceConfig } from "@/lib/huggingface/config";
import { parseDetailInsightResponse } from "@/lib/huggingface/parse-detail-insight-response";
import {
  buildRegionDetailInsightUserPrompt,
  REGION_DETAIL_INSIGHT_SYSTEM_PROMPT,
  type RegionDetailInsightContext,
} from "@/lib/region-excel/build-region-detail-insight-context";
import type { RegionDetailInsightsSections } from "@/lib/region-excel/types";

export type GenerateRegionDetailInsightsResult = {
  sections: RegionDetailInsightsSections;
  source: "huggingface" | "fallback";
  model?: string;
  warning?: string;
};

type ChatMessage = {
  content?: string | null;
  reasoning_content?: string | null;
};

type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string;
    message?: ChatMessage;
  }>;
  error?: {
    message?: string;
  };
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

export async function generateRegionDetailInsightsWithHf(
  context: RegionDetailInsightContext,
  fallbackSections: RegionDetailInsightsSections,
): Promise<GenerateRegionDetailInsightsResult> {
  const config = getHuggingfaceConfig();

  if (!config.enabled || !config.apiKey) {
    return {
      sections: fallbackSections,
      source: "fallback",
      warning: "HUGGINGFACE_API_KEY가 설정되지 않아 규칙 기반 요약을 표시합니다.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: REGION_DETAIL_INSIGHT_SYSTEM_PROMPT },
          { role: "user", content: buildRegionDetailInsightUserPrompt(context) },
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const payload = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      const message =
        payload.error?.message ??
        `Hugging Face API 오류 (${response.status})`;
      throw new Error(message);
    }

    const choice = payload.choices?.[0];
    const content = extractAssistantText(choice?.message);

    if (!content) {
      const finishReason = choice?.finish_reason ?? "unknown";
      throw new Error(
        `모델 응답이 비어 있습니다. (finish_reason=${finishReason}, max_tokens=${config.maxTokens})`,
      );
    }

    const sections = parseDetailInsightResponse(content);
    if (!sections) {
      throw new Error("모델 응답을 인사이트 섹션으로 해석하지 못했습니다.");
    }

    return {
      sections,
      source: "huggingface",
      model: config.model,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 요약 생성에 실패했습니다.";

    return {
      sections: fallbackSections,
      source: "fallback",
      model: config.model,
      warning: `${message} 규칙 기반 요약을 표시합니다.`,
    };
  }
}
