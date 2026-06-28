"use client";

import { useCallback, useRef, useState } from "react";
import {
  COVER_HELP_ICON_SRC,
  REGION_SOURCE_EXCEL_DOWNLOAD_PATH,
} from "@/lib/cover-help";

const FLOW_STEPS = [
  {
    step: 1,
    title: "관광소비 데이터",
    lines: ["카드 데이터 기반", "250개 시군구", "월별 집계"],
  },
  {
    step: 2,
    title: "업종별 탄소배출계수 적용",
    lines: ["6대분류·22중분류", "소비 → 배출량 환산"],
  },
  {
    step: 3,
    title: "보정계수 적용 (AHP 기반)",
    lines: ["전문가 AHP 가중", "3대 보정요인", "지역 특성 반영"],
  },
  {
    step: 4,
    title: "이동 관련 보정",
    lines: ["관광지 간 이동", "카드 기반 추정", "이동수단별 계수"],
  },
  {
    step: 5,
    title: "최종 관광 탄소발자국 산출",
    lines: ["최종 합산", "지역·기간 비교", "대시보드 반영"],
  },
] as const;

const FACTOR_CARDS = [
  {
    title: "업종별 계수",
    lines: ["6대분류·22중분류", "단위: kgCO₂e/원"],
  },
  {
    title: "AHP 보정",
    lines: ["전문가 분석", "3대 보정요인", "가중치 벡터"],
  },
  {
    title: "지역 에너지 보정",
    lines: ["전력·연료 차이", "지역 에너지 믹스"],
  },
  {
    title: "이동 관련 반영",
    lines: ["거리·수단(자가용·버스 등)", "카드 기반 추정"],
  },
] as const;

const DATA_SCOPE = [
  { label: "기간", value: "2023.01 ~ 2026.04" },
  { label: "지역", value: "250개 시군구" },
  { label: "업종", value: "6대분류·22중분류" },
  { label: "버전", value: "관광행동기반 v1.0" },
] as const;

const FAQ_ITEMS = [
  {
    q: "단순 합산인가요?",
    a: "소비 × 배출계수 × 보정계수를 적용한 구조적 산정입니다.",
  },
  {
    q: "지자체 차이는?",
    a: "에너지·이동 특성을 반영해 지역별로 차등 적용합니다.",
  },
  {
    q: "향후 업데이트?",
    a: "새 계수·보정 반영 시 버전 업데이트 예정입니다.",
  },
] as const;

function FlowStepIcon({ step }: { step: number }) {
  const common = {
    viewBox: "0 0 40 40",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (step) {
    case 1:
      return (
        <svg {...common}>
          <rect x="8" y="12" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.75" />
          <path d="M14 18h12M14 22h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <circle cx="20" cy="18" r="7" stroke="currentColor" strokeWidth="1.75" />
          <path d="M16 28h8l-1 6h-6l-1-6Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M10 26h20M20 10v16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M14 14h12l-4 8H18l-4-8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 4:
      return (
        <svg {...common}>
          <path d="M10 28h14l4-8H14l-4 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <circle cx="14" cy="28" r="2" fill="currentColor" />
          <circle cx="26" cy="28" r="2" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.75" />
          <path d="M20 14v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
  }
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 14.5v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function parseDownloadFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = contentDisposition.match(/filename="([^"]+)"/i);
  return asciiMatch?.[1] ?? null;
}

type DataScopeDownloadButtonProps = {
  className?: string;
};

function DataScopeDownloadButton({ className }: DataScopeDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const response = await fetch(REGION_SOURCE_EXCEL_DOWNLOAD_PATH);

      if (!response.ok) {
        throw new Error("download failed");
      }

      const blob = await response.blob();
      const filename =
        parseDownloadFilename(response.headers.get("Content-Disposition")) ??
        "탄소발자국_수식_산정(시안용).xlsx";
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert("엑셀 파일을 다운로드하지 못했습니다.");
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading]);

  return (
    <div className={className}>
      <button
        type="button"
        className="calc-guide-scope__download-btn"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <DownloadIcon />
        {isDownloading ? "다운로드 중…" : "원본 엑셀 다운로드"}
      </button>
    </div>
  );
}

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

type CoverCalculationGuideDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
};

export function CoverCalculationGuideDialog({
  dialogRef,
  onClose,
}: CoverCalculationGuideDialogProps) {
  const handleDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className="calc-guide-dialog"
      aria-labelledby="calc-guide-title"
      onClick={handleDialogClick}
      onClose={onClose}
    >
      <div className="calc-guide-dialog__panel">
        <button
          type="button"
          className="calc-guide-dialog__close"
          aria-label="닫기"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <header className="calc-guide-dialog__header">
          <div className="calc-guide-dialog__title-block">
            <div className="calc-guide-dialog__title-row">
              <h2 id="calc-guide-title" className="calc-guide-dialog__title">
                산정 방식 안내
              </h2>
            </div>
            <p className="calc-guide-dialog__subtitle">
              관광 탄소발자국 산정 흐름 및 계수·보정 방식 설명
            </p>
          </div>
        </header>

        <div className="calc-guide-dialog__body">
          <div className="calc-guide-dialog__intro-row">
            <article className="calc-guide-card calc-guide-card--intro">
              <h3 className="calc-guide-card__title">산정 개요</h3>
              <p className="calc-guide-card__text">
                본 대시보드는 카드 소비 데이터·업종별 배출계수·보정계수를 활용해
                관광 탄소발자국을 지역 단위로 산정합니다.
              </p>
            </article>
            <article className="calc-guide-card calc-guide-card--intro">
              <h3 className="calc-guide-card__title">도움말</h3>
              <p className="calc-guide-card__text">
                아래 세부 산정식 및 흐름도를 참고하세요. 투명한 지표 제공을 위해
                산정 구성요소를 안내합니다.
              </p>
            </article>
          </div>

          <div className="calc-guide-dialog__main">
            <div className="calc-guide-dialog__primary">
              <section className="calc-guide-flow" aria-label="관광 탄소발자국 산정 흐름도">
                <h3 className="calc-guide-section__title">관광 탄소발자국 산정 흐름도</h3>
                <ol className="calc-guide-flow__list">
                  {FLOW_STEPS.map((item) => (
                    <li key={item.step} className="calc-guide-flow__step">
                      <div className="calc-guide-flow__icon">
                        <FlowStepIcon step={item.step} />
                      </div>
                      <div className="calc-guide-flow__content">
                        <span className="calc-guide-flow__number">{item.step}</span>
                        <strong className="calc-guide-flow__label">{item.title}</strong>
                        {item.lines.map((line) => (
                          <span key={line} className="calc-guide-flow__detail">
                            {line}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="calc-guide-formula" aria-label="산정식 개요">
                <h3 className="calc-guide-section__title">산정식(개요)</h3>
                <p className="calc-guide-formula__equation">
                  최종 관광 탄소발자국 (kgCO₂e) = Σ [ (업종별 소비금액<sub>i</sub> ×
                  업종별 탄소배출계수<sub>i</sub> × AHP 보정계수<sub>k</sub> × 지역
                  에너지 보정계수) + 이동 관련 탄소발자국 ]
                </p>
                <p className="calc-guide-formula__legend">
                  <span>
                    <em>i</em>: 중분류 업종
                  </span>
                  <span>
                    <em>k</em>: 보정요인
                  </span>
                  <span>
                    <em>reg</em>: 지역
                  </span>
                </p>
              </section>
            </div>

            <aside className="calc-guide-dialog__sidebar" aria-label="산정 구성요소">
              {FACTOR_CARDS.map((card) => (
                <article key={card.title} className="calc-guide-card calc-guide-card--factor">
                  <h3 className="calc-guide-card__title">{card.title}</h3>
                  {card.lines.map((line) => (
                    <p key={line} className="calc-guide-card__text">
                      {line}
                    </p>
                  ))}
                </article>
              ))}
            </aside>
          </div>

          <div className="calc-guide-dialog__bottom">
            <section className="calc-guide-scope" aria-label="데이터 범위">
              <h3 className="calc-guide-section__title">데이터 범위</h3>
              <ul className="calc-guide-scope__list">
                {DATA_SCOPE.map((item) => (
                  <li key={item.label} className="calc-guide-scope__item">
                    <span className="calc-guide-scope__label">{item.label}</span>
                    <span className="calc-guide-scope__value">{item.value}</span>
                  </li>
                ))}
              </ul>
              <DataScopeDownloadButton className="calc-guide-scope__actions" />
            </section>

            <section className="calc-guide-faq" aria-label="자주 묻는 질문">
              <h3 className="calc-guide-section__title">FAQ / 주석</h3>
              <ul className="calc-guide-faq__list">
                {FAQ_ITEMS.map((item) => (
                  <li key={item.q} className="calc-guide-faq__item">
                    <p className="calc-guide-faq__q">Q. {item.q}</p>
                    <p className="calc-guide-faq__a">A. {item.a}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <footer className="calc-guide-dialog__footer">
          본 산정 방식은 관광 소비 데이터와 과학적 근거 기반 방법론에 따라 산정되며,
          데이터 기반 의사결정을 지원하기 위해 정확도 개선을 지속합니다.
        </footer>
      </div>
    </dialog>
  );
}

export function CoverHelpButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openHelp = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeHelp = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  return (
    <>
      <button
        type="button"
        className="hero-help-btn"
        aria-label="산정 방식 안내 열기"
        onClick={openHelp}
      >
        <img
          className="hero-help-btn__image"
          src={COVER_HELP_ICON_SRC}
          alt=""
          width={128}
          height={128}
          decoding="async"
        />
      </button>

      <CoverCalculationGuideDialog dialogRef={dialogRef} onClose={closeHelp} />
    </>
  );
}
