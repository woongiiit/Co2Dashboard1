import type { CoverNavIconVariant } from "@/components/cover/CoverNavIcon";

export const COVER_NAV_ITEMS = [
  {
    href: "/region",
    icon: "region",
    title: "지역 중심",
    subtitleLines: [
      "전국 시도·시군구 단위",
      "탄소발자국 현황과",
      "순위, 추세를 확인합니다.",
    ],
    imageSrc: "/images/cover/nav/region.png",
    iconSrc: "/images/cover/nav/icons/region-icon.png",
  },
  {
    href: "/industry",
    icon: "industry",
    title: "업종 중심",
    subtitleLines: [
      "대분류·중분류 업종별",
      "탄소발자국 구조와",
      "비교 분석을 제공합니다.",
    ],
    imageSrc: "/images/cover/nav/industry.png",
    iconSrc: "/images/cover/nav/icons/industry-icon.png",
  },
  {
    href: "/ai-consulting",
    icon: "ai-consulting",
    title: "AI 컨설팅",
    subtitleLines: [
      "지자체 관광 여건에 맞춘",
      "감축 제안과 우선 실행",
      "과제를 확인합니다.",
    ],
    imageSrc: "/images/cover/nav/ai-consulting.png",
    iconSrc: "/images/cover/nav/icons/ai-consulting-icon.png",
  },
] as const;

export function getCoverNavIconSrc(
  variant: CoverNavIconVariant,
): string | undefined {
  return COVER_NAV_ITEMS.find((item) => item.icon === variant)?.iconSrc;
}
