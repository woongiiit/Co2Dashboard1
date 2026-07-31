import { getSidoLabelFromCode } from "@/lib/region-excel/format";

export type DashboardScopeSummary = {
  title: string;
  description: string;
  trendTitle: string;
};

/** 지역 대시보드: 시도 필터 기준 집계 안내 */
export function buildRegionDashboardScopeSummary(
  sidoCode: string,
): DashboardScopeSummary {
  if (sidoCode === "all") {
    return {
      title: "집계 범위: 전국",
      description:
        "시도·시군구를 전체(전국)로 두면 KPI·월별 추세·순위는 전국 시군구를 합산합니다. 지도·순위는 기간 종료 시점의 행정구역 기준입니다.",
      trendTitle: "전국 월별 관광 탄소발자국 추세",
    };
  }

  const sidoLabel = getSidoLabelFromCode(sidoCode) ?? "선택 시도";
  return {
    title: `집계 범위: ${sidoLabel} 전체`,
    description: `${sidoLabel} 내 시군구를 합산한 지표입니다. 특정 시군구를 선택하면 지역 상세 분석으로 이동합니다.`,
    trendTitle: `${sidoLabel} 월별 관광 탄소발자국 추세`,
  };
}

/** 업종·AI 컨설팅: 시도 + 시군구 필터 기준 집계 안내 */
export function buildRegionSelectionScopeSummary(
  sidoCode: string,
  regionLabel: string,
): DashboardScopeSummary {
  if (sidoCode === "all" && (regionLabel === "all" || !regionLabel)) {
    return {
      title: "집계 범위: 전국",
      description:
        "시도·시군구를 전체로 두면 탄소 지표는 전국을 합산한 값입니다. 시도 또는 시군구를 좁히면 해당 범위만 집계합니다.",
      trendTitle: "전국 월별 관광 탄소발자국 추세",
    };
  }

  if (regionLabel !== "all" && regionLabel) {
    return {
      title: `집계 범위: ${regionLabel}`,
      description: `선택한 시군구(${regionLabel}) 기준으로 탄소 지표를 집계합니다.`,
      trendTitle: `${regionLabel} 월별 관광 탄소발자국 추세`,
    };
  }

  const sidoLabel = getSidoLabelFromCode(sidoCode) ?? "선택 시도";
  return {
    title: `집계 범위: ${sidoLabel} 전체`,
    description: `${sidoLabel} 내 시군구를 합산한 지표입니다. 시군구를 지정하면 해당 지역만 집계합니다.`,
    trendTitle: `${sidoLabel} 월별 관광 탄소발자국 추세`,
  };
}
