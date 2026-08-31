"use client";

import { useCallback, useRef } from "react";
import { PlaceholderTable } from "@/components/dashboard/PlaceholderTable";
import type { TableRow } from "@/lib/mock-dashboard-data";

const RANKING_COLUMNS = [
  "순위",
  "시군구",
  "총 관광 탄소발자국",
  "전년 대비",
] as const;

const TOP_RANKING_COUNT = 10;

type RegionRankingPanelProps = {
  rows: TableRow[];
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

export function RegionRankingPanel({ rows }: RegionRankingPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const topRows = rows.slice(0, TOP_RANKING_COUNT);
  const showViewAll = rows.length > TOP_RANKING_COUNT;

  const openDialog = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  return (
    <>
      <div className="region-ranking-panel">
        <PlaceholderTable columns={[...RANKING_COLUMNS]} rows={topRows} />
        {showViewAll ? (
          <div className="region-ranking-panel__actions">
            <button
              type="button"
              className="region-ranking-panel__view-all"
              onClick={openDialog}
            >
              [전체 순위 보기]
            </button>
          </div>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        className="region-ranking-dialog"
        aria-labelledby="region-ranking-dialog-title"
        onClick={handleDialogClick}
        onClose={closeDialog}
      >
        <div className="region-ranking-dialog__panel">
          <header className="region-ranking-dialog__header">
            <div>
              <h2
                id="region-ranking-dialog-title"
                className="region-ranking-dialog__title"
              >
                시군구 탄소발자국 전체 순위
              </h2>
              <p className="region-ranking-dialog__subtitle">
                총 {rows.length}개 시군구 · 스크롤하여 전체 순위를 확인할 수
                있습니다.
              </p>
            </div>
            <button
              type="button"
              className="region-ranking-dialog__close"
              aria-label="닫기"
              onClick={closeDialog}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="region-ranking-dialog__scroll">
            <PlaceholderTable
              columns={[...RANKING_COLUMNS]}
              rows={rows}
              showNote={false}
            />
          </div>

          <footer className="region-ranking-dialog__footer">
            <p className="region-ranking-dialog__note">
              * 탄소발자국 기준 임시 순위 데이터입니다.
            </p>
          </footer>
        </div>
      </dialog>
    </>
  );
}
