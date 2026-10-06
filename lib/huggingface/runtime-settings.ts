import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { DEFAULT_HUGGINGFACE_MODEL } from "@/lib/huggingface/preset-models";

export type HuggingfaceRuntimeSettings = {
  apiKey?: string;
  model?: string;
  updatedAt?: string;
};

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const SETTINGS_PATH = path.join(RUNTIME_DIR, "huggingface-settings.json");

function ensureRuntimeDir(): void {
  if (!existsSync(RUNTIME_DIR)) {
    mkdirSync(RUNTIME_DIR, { recursive: true });
  }
}

export function readHuggingfaceRuntimeSettings(): HuggingfaceRuntimeSettings {
  try {
    if (!existsSync(SETTINGS_PATH)) return {};
    const raw = readFileSync(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(raw) as HuggingfaceRuntimeSettings;
    return {
      apiKey:
        typeof parsed.apiKey === "string" && parsed.apiKey.trim()
          ? parsed.apiKey.trim()
          : undefined,
      model:
        typeof parsed.model === "string" && parsed.model.trim()
          ? parsed.model.trim()
          : undefined,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return {};
  }
}

export function writeHuggingfaceRuntimeSettings(
  next: HuggingfaceRuntimeSettings,
): HuggingfaceRuntimeSettings {
  ensureRuntimeDir();
  const current = readHuggingfaceRuntimeSettings();
  const merged: HuggingfaceRuntimeSettings = {
    apiKey:
      next.apiKey !== undefined
        ? next.apiKey.trim() || undefined
        : current.apiKey,
    model:
      next.model !== undefined
        ? next.model.trim() || DEFAULT_HUGGINGFACE_MODEL
        : current.model,
    updatedAt: new Date().toISOString(),
  };

  writeFileSync(SETTINGS_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return merged;
}

export function maskHuggingfaceApiKey(apiKey: string | undefined): string | null {
  if (!apiKey) return null;
  if (apiKey.length <= 8) return "••••••••";
  return `${apiKey.slice(0, 4)}••••••••${apiKey.slice(-4)}`;
}
