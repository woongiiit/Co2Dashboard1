import { DEFAULT_HUGGINGFACE_MODEL } from "@/lib/huggingface/preset-models";
import { readHuggingfaceRuntimeSettings } from "@/lib/huggingface/runtime-settings";

export type HuggingfaceConfig = {
  apiKey: string | undefined;
  model: string;
  apiUrl: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
};

/**
 * 우선순위: 런타임 설정(UI 저장) > 환경변수(.env)
 * 공유받은 프로젝트를 로컬에서 실행할 때 모달로 키·모델을 넣을 수 있게 함.
 */
export function getHuggingfaceConfig(): HuggingfaceConfig {
  const runtime = readHuggingfaceRuntimeSettings();
  const apiKey =
    runtime.apiKey?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    undefined;
  const model =
    runtime.model?.trim() ||
    process.env.HUGGINGFACE_MODEL?.trim() ||
    DEFAULT_HUGGINGFACE_MODEL;
  const apiUrl =
    process.env.HUGGINGFACE_API_URL?.trim() ||
    "https://router.huggingface.co/v1/chat/completions";
  const maxTokens = Number(process.env.HUGGINGFACE_MAX_TOKENS ?? "1500");
  const temperature = Number(process.env.HUGGINGFACE_TEMPERATURE ?? "0.2");

  return {
    apiKey,
    model,
    apiUrl,
    maxTokens: Number.isFinite(maxTokens) ? maxTokens : 1500,
    temperature: Number.isFinite(temperature) ? temperature : 0.2,
    enabled: Boolean(apiKey),
  };
}
