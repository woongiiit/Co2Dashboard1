"use client";

type AiConsultingFilterApplyButtonProps = {
  onApply: () => void;
  loading?: boolean;
};

export function AiConsultingFilterApplyButton({
  onApply,
  loading = false,
}: AiConsultingFilterApplyButtonProps) {
  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={onApply}
      disabled={loading}
    >
      {loading ? "생성 중…" : "적용"}
    </button>
  );
}
