"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_HUGGINGFACE_MODEL,
  HUGGINGFACE_CUSTOM_MODEL_OPTION,
  HUGGINGFACE_PRESET_MODELS,
  isHuggingfacePresetModel,
} from "@/lib/huggingface/preset-models";

type SettingsResponse = {
  hasApiKey: boolean;
  apiKeyMasked: string | null;
  model: string;
  isCustomModel: boolean;
  source: "runtime" | "env" | "default";
  updatedAt?: string;
  error?: string;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function sourceLabel(source: SettingsResponse["source"]): string {
  switch (source) {
    case "runtime":
      return "이 PC에 저장된 설정";
    case "env":
      return ".env 환경변수";
    default:
      return "기본값";
  }
}

export function CoverSettingsButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [modelSelect, setModelSelect] = useState<string>(DEFAULT_HUGGINGFACE_MODEL);
  const [customModel, setCustomModel] = useState("");
  const [source, setSource] = useState<SettingsResponse["source"]>("default");

  const applyResponse = useCallback((data: SettingsResponse) => {
    setHasApiKey(data.hasApiKey);
    setApiKeyMasked(data.apiKeyMasked);
    setSource(data.source);
    if (data.isCustomModel || !isHuggingfacePresetModel(data.model)) {
      setModelSelect(HUGGINGFACE_CUSTOM_MODEL_OPTION);
      setCustomModel(data.model);
    } else {
      setModelSelect(data.model);
      setCustomModel("");
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch("/api/settings/huggingface");
      const data = (await response.json()) as SettingsResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "설정을 불러오지 못했습니다.");
      }
      applyResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [applyResponse]);

  const openSettings = useCallback(() => {
    dialogRef.current?.showModal();
    void loadSettings();
  }, [loadSettings]);

  const closeSettings = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        closeSettings();
      }
    },
    [closeSettings],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setApiKeyInput("");
      setError(null);
      setStatus(null);
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setStatus(null);

    const resolvedModel =
      modelSelect === HUGGINGFACE_CUSTOM_MODEL_OPTION
        ? customModel.trim()
        : modelSelect;

    if (!resolvedModel) {
      setError("모델을 선택하거나 Hugging Face 모델명을 입력해 주세요.");
      setSaving(false);
      return;
    }

    if (modelSelect === HUGGINGFACE_CUSTOM_MODEL_OPTION) {
      if (!/^[\w./-]+$/.test(resolvedModel) || resolvedModel.includes("..")) {
        setError(
          "모델명은 org/model-name 형식이어야 합니다. Hugging Face 모델 페이지의 이름을 그대로 붙여넣으세요.",
        );
        setSaving(false);
        return;
      }
    }

    try {
      const body: {
        model: string;
        apiKey?: string;
        clearApiKey?: boolean;
      } = { model: resolvedModel };

      if (apiKeyInput.trim()) {
        body.apiKey = apiKeyInput.trim();
      }

      const response = await fetch("/api/settings/huggingface", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as SettingsResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "설정을 저장하지 못했습니다.");
      }
      applyResponse(data);
      setApiKeyInput("");
      setStatus("저장되었습니다. AI 요약·인사이트에 바로 반영됩니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }, [apiKeyInput, applyResponse, customModel, modelSelect]);

  const handleClearApiKey = useCallback(async () => {
    if (!hasApiKey) return;
    const confirmed = window.confirm(
      "저장된 Hugging Face 토큰을 이 PC에서 삭제할까요?",
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const resolvedModel =
        modelSelect === HUGGINGFACE_CUSTOM_MODEL_OPTION
          ? customModel.trim() || DEFAULT_HUGGINGFACE_MODEL
          : modelSelect;
      const response = await fetch("/api/settings/huggingface", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clearApiKey: true,
          model: resolvedModel,
        }),
      });
      const data = (await response.json()) as SettingsResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "토큰을 삭제하지 못했습니다.");
      }
      applyResponse(data);
      setApiKeyInput("");
      setStatus(
        "런타임에 저장된 토큰을 삭제했습니다. .env에 키가 있으면 그쪽이 계속 사용될 수 있습니다.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "토큰을 삭제하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }, [applyResponse, customModel, hasApiKey, modelSelect]);

  const isCustom = modelSelect === HUGGINGFACE_CUSTOM_MODEL_OPTION;

  return (
    <>
      <button
        type="button"
        className="hero-settings-btn"
        aria-label="환경 설정"
        onClick={openSettings}
      >
        환경 설정
      </button>

      <dialog
        ref={dialogRef}
        className="settings-dialog"
        aria-labelledby="settings-dialog-title"
        onClick={handleDialogClick}
        onClose={closeSettings}
      >
        <div className="settings-dialog__panel">
          <button
            type="button"
            className="settings-dialog__close"
            aria-label="닫기"
            onClick={closeSettings}
          >
            <CloseIcon />
          </button>

          <header className="settings-dialog__header">
            <h2 id="settings-dialog-title" className="settings-dialog__title">
              환경 설정
            </h2>
            <p className="settings-dialog__subtitle">
              Hugging Face API 토큰과 모델을 이 PC에만 저장합니다. 프로젝트 zip
              공유 시 키는 포함되지 않으며, 받는 사람이 여기서 자신의 토큰을
              등록하면 됩니다.
            </p>
          </header>

          <div className="settings-dialog__body">
            {loading ? (
              <p className="settings-dialog__status" role="status">
                설정을 불러오는 중…
              </p>
            ) : (
              <form
                className="settings-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSave();
                }}
              >
                <label className="settings-form__field" htmlFor="hf-api-key">
                  <span className="settings-form__label">
                    Hugging Face API 토큰
                  </span>
                  <input
                    id="hf-api-key"
                    type="password"
                    autoComplete="off"
                    className="settings-form__input"
                    placeholder={
                      hasApiKey
                        ? "새 토큰 입력 시에만 덮어씁니다"
                        : "hf_로 시작하는 토큰"
                    }
                    value={apiKeyInput}
                    onChange={(event) => setApiKeyInput(event.target.value)}
                  />
                  <span className="settings-form__hint">
                    {hasApiKey && apiKeyMasked
                      ? `현재 등록됨: ${apiKeyMasked} · 출처: ${sourceLabel(source)}`
                      : "https://huggingface.co/settings/tokens 에서 발급"}
                  </span>
                </label>

                <label className="settings-form__field" htmlFor="hf-model">
                  <span className="settings-form__label">모델</span>
                  <select
                    id="hf-model"
                    className="settings-form__select"
                    value={modelSelect}
                    onChange={(event) => setModelSelect(event.target.value)}
                  >
                    {HUGGINGFACE_PRESET_MODELS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} ({item.id})
                      </option>
                    ))}
                    <option value={HUGGINGFACE_CUSTOM_MODEL_OPTION}>
                      직접 입력
                    </option>
                  </select>
                </label>

                {isCustom ? (
                  <label
                    className="settings-form__field"
                    htmlFor="hf-model-custom"
                  >
                    <span className="settings-form__label">
                      Hugging Face 모델명
                    </span>
                    <input
                      id="hf-model-custom"
                      type="text"
                      className="settings-form__input"
                      placeholder="예: Qwen/Qwen2.5-32B-Instruct"
                      value={customModel}
                      onChange={(event) => setCustomModel(event.target.value)}
                      spellCheck={false}
                    />
                    <span className="settings-form__hint settings-form__hint--emphasis">
                      Hugging Face 모델 페이지 상단의 모델 ID를 그대로
                      복사·붙여넣기 하세요. (예:{" "}
                      <code>meta-llama/Llama-3.1-8B-Instruct</code>)
                    </span>
                  </label>
                ) : null}

                {error ? (
                  <p className="settings-dialog__error" role="alert">
                    {error}
                  </p>
                ) : null}
                {status ? (
                  <p className="settings-dialog__status" role="status">
                    {status}
                  </p>
                ) : null}

                <div className="settings-form__actions">
                  <button
                    type="button"
                    className="settings-form__btn settings-form__btn--ghost"
                    onClick={() => void handleClearApiKey()}
                    disabled={saving || !hasApiKey}
                  >
                    토큰 삭제
                  </button>
                  <button
                    type="button"
                    className="settings-form__btn settings-form__btn--secondary"
                    onClick={closeSettings}
                    disabled={saving}
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="settings-form__btn settings-form__btn--primary"
                    disabled={saving || loading}
                  >
                    {saving ? "저장 중…" : "저장"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
