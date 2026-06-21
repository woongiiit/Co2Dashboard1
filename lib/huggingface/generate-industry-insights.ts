import { getHuggingfaceConfig } from "@/lib/huggingface/config";
import { parseInsightResponse } from "@/lib/huggingface/parse-insight-response";
import {
  buildIndustryDeepInsightUserPrompt,
  buildIndustryInsightUserPrompt,
  INDUSTRY_DEEP_INSIGHT_SYSTEM_PROMPT,
  INDUSTRY_INSIGHT_SYSTEM_PROMPT,
  type IndustryDeepInsightContext,
  type IndustryInsightContext,
} from "@/lib/industry-excel/build-industry-insight-context";

export type GenerateIndustryInsightsResult = {
  items: string[];
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
  error?: { message?: string };
};

function extractAssistantText(message: ChatMessage | undefined): string {
  if (!message) return "";
  const content = message.content?.trim();
  if (content) return content;
  const reasoning = message.reasoning_content?.trim();
  if (!reasoning) return "";
  const jsonMatch = reasoning.match(/\[[\s\S]*\]\s*$/);
  if (jsonMatch) return jsonMatch[0].trim();
  return reasoning;
}

async function callHfInsightApi(
  systemPrompt: string,
  userPrompt: string,
  fallbackItems: string[],
): Promise<GenerateIndustryInsightsResult> {
  const config = getHuggingfaceConfig();

  if (!config.enabled || !config.apiKey) {
    return {
      items: fallbackItems,
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
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
      throw new Error(
        payload.error?.message ?? `Hugging Face API 오류 (${response.status})`,
      );
    }

    const content = extractAssistantText(payload.choices?.[0]?.message);
    if (!content) {
      throw new Error("모델 응답이 비어 있습니다.");
    }

    const items = parseInsightResponse(content);
    if (items.length === 0) {
      throw new Error("모델 응답을 인사이트 목록으로 해석하지 못했습니다.");
    }

    return { items, source: "huggingface", model: config.model };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 요약 생성에 실패했습니다.";
    return {
      items: fallbackItems,
      source: "fallback",
      model: config.model,
      warning: `${message} 규칙 기반 요약을 표시합니다.`,
    };
  }
}

export async function generateIndustryInsightsWithHf(
  context: IndustryInsightContext,
  fallbackItems: string[],
): Promise<GenerateIndustryInsightsResult> {
  return callHfInsightApi(
    INDUSTRY_INSIGHT_SYSTEM_PROMPT,
    buildIndustryInsightUserPrompt(context),
    fallbackItems,
  );
}

export async function generateIndustryDeepInsightsWithHf(
  context: IndustryDeepInsightContext,
  fallbackItems: string[],
): Promise<GenerateIndustryInsightsResult> {
  return callHfInsightApi(
    INDUSTRY_DEEP_INSIGHT_SYSTEM_PROMPT,
    buildIndustryDeepInsightUserPrompt(context),
    fallbackItems,
  );
}
