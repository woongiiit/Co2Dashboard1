export type HuggingfaceConfig = {
  apiKey: string | undefined;
  model: string;
  apiUrl: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
};

export function getHuggingfaceConfig(): HuggingfaceConfig {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim() || undefined;
  const model =
    process.env.HUGGINGFACE_MODEL?.trim() || "Qwen/Qwen3.5-35B-A3B";
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
