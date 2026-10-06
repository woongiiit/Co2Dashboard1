import { NextResponse } from "next/server";
import { getHuggingfaceConfig } from "@/lib/huggingface/config";
import {
  isHuggingfacePresetModel,
} from "@/lib/huggingface/preset-models";
import {
  maskHuggingfaceApiKey,
  readHuggingfaceRuntimeSettings,
  writeHuggingfaceRuntimeSettings,
} from "@/lib/huggingface/runtime-settings";

export const runtime = "nodejs";

export type HuggingfaceSettingsResponse = {
  hasApiKey: boolean;
  apiKeyMasked: string | null;
  model: string;
  isCustomModel: boolean;
  source: "runtime" | "env" | "default";
  updatedAt?: string;
};

function buildResponse(): HuggingfaceSettingsResponse {
  const runtime = readHuggingfaceRuntimeSettings();
  const config = getHuggingfaceConfig();
  const source: HuggingfaceSettingsResponse["source"] = runtime.apiKey
    ? "runtime"
    : process.env.HUGGINGFACE_API_KEY?.trim()
      ? "env"
      : runtime.model
        ? "runtime"
        : process.env.HUGGINGFACE_MODEL?.trim()
          ? "env"
          : "default";

  return {
    hasApiKey: Boolean(config.apiKey),
    apiKeyMasked: maskHuggingfaceApiKey(config.apiKey),
    model: config.model,
    isCustomModel: !isHuggingfacePresetModel(config.model),
    source,
    updatedAt: runtime.updatedAt,
  };
}

export async function GET() {
  try {
    return NextResponse.json(buildResponse());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "설정을 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type PutBody = {
  apiKey?: string | null;
  model?: string | null;
  clearApiKey?: boolean;
};

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as PutBody;
    const patch: {
      apiKey?: string;
      model?: string;
    } = {};

    if (body.clearApiKey === true) {
      patch.apiKey = "";
    } else if (typeof body.apiKey === "string" && body.apiKey.trim()) {
      patch.apiKey = body.apiKey.trim();
    }

    if (typeof body.model === "string" && body.model.trim()) {
      const model = body.model.trim();
      if (!/^[\w./-]+$/.test(model) || model.includes("..")) {
        return NextResponse.json(
          { error: "모델명은 Hugging Face 형식(예: org/model-name)이어야 합니다." },
          { status: 400 },
        );
      }
      patch.model = model;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "변경할 설정이 없습니다." },
        { status: 400 },
      );
    }

    writeHuggingfaceRuntimeSettings(patch);
    return NextResponse.json(buildResponse());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "설정을 저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
