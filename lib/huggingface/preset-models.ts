/** Hugging Face Inference용 대표 LLM 프리셋 (직접 입력 제외). */
export const HUGGINGFACE_PRESET_MODELS = [
  {
    id: "Qwen/Qwen3.5-35B-A3B",
    label: "Qwen3.5 35B-A3B",
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    label: "Qwen2.5 72B Instruct",
  },
  {
    id: "Qwen/Qwen2.5-7B-Instruct",
    label: "Qwen2.5 7B Instruct",
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    label: "Llama 3.3 70B Instruct",
  },
  {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    label: "Llama 3.1 8B Instruct",
  },
  {
    id: "mistralai/Mistral-7B-Instruct-v0.3",
    label: "Mistral 7B Instruct v0.3",
  },
  {
    id: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    label: "Mixtral 8x7B Instruct",
  },
  {
    id: "google/gemma-2-27b-it",
    label: "Gemma 2 27B IT",
  },
  {
    id: "google/gemma-2-9b-it",
    label: "Gemma 2 9B IT",
  },
  {
    id: "microsoft/Phi-3.5-mini-instruct",
    label: "Phi-3.5 Mini Instruct",
  },
] as const;

export const HUGGINGFACE_CUSTOM_MODEL_OPTION = "__custom__" as const;

export const DEFAULT_HUGGINGFACE_MODEL = HUGGINGFACE_PRESET_MODELS[0].id;

export type HuggingfacePresetModelId =
  (typeof HUGGINGFACE_PRESET_MODELS)[number]["id"];

export function isHuggingfacePresetModel(model: string): boolean {
  return HUGGINGFACE_PRESET_MODELS.some((item) => item.id === model);
}
