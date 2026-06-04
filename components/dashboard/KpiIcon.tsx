export type IndustryKpiIconVariant =
  | "industry-carbon"
  | "share-pie"
  | "tourism-spend"
  | "carbon-intensity"
  | "yoy-trend";

export type RegionKpiIconVariant =
  | "region-total-carbon"
  | "region-per-capita"
  | "region-spend-intensity"
  | "region-top-share"
  | "region-priority";

export type RegionDetailKpiIconVariant =
  | "detail-region-carbon"
  | "detail-national-rank"
  | "detail-sido-rank"
  | "detail-spend-intensity";

export type AiConsultingKpiIconVariant =
  | "ai-total-carbon"
  | "ai-national-rank"
  | "ai-major-industry"
  | "ai-trend";

export type KpiIconVariant =
  | IndustryKpiIconVariant
  | RegionKpiIconVariant
  | RegionDetailKpiIconVariant
  | AiConsultingKpiIconVariant;

type KpiIconProps = {
  variant: KpiIconVariant;
};

export function KpiIcon({ variant }: KpiIconProps) {
  switch (variant) {
    case "industry-carbon":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <ellipse cx="16" cy="18" rx="9" ry="6" fill="#7EC8E8" />
          <ellipse cx="13" cy="15" rx="5" ry="4" fill="#B8E4F5" />
          <ellipse cx="19" cy="14" rx="4" ry="3.5" fill="#A8DDF0" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="#2B7CB8"
            fontSize="7"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "share-pie":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#FFE4CC" />
          <path d="M16 5v11h11" fill="#F97316" />
          <path d="M16 16 27 16A11 11 0 0 1 16 5Z" fill="#FDBA74" />
        </svg>
      );
    case "tourism-spend":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#FEF3C7" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#CA8A04"
            fontSize="14"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            ₩
          </text>
        </svg>
      );
    case "carbon-intensity":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#D1FAE5" />
          <path
            d="M16 8c-2 4-6 5-6 9a6 6 0 0 0 12 0c0-4-4-5-6-9Z"
            fill="#34D399"
          />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#047857"
            fontSize="6"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "yoy-trend":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#DBEAFE" />
          <path
            d="M9 20 14 15l4 4 6-8"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 11h3v3"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "region-total-carbon":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#E8F4FC" />
          <ellipse cx="16" cy="17" rx="7" ry="5" fill="#7EC8E8" />
          <text
            x="16"
            y="19"
            textAnchor="middle"
            fill="#2B7CB8"
            fontSize="6"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "region-per-capita":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#E8F8EF" />
          <circle cx="16" cy="13" r="3.5" fill="#5CB86A" />
          <path
            d="M10 22c0-3.3 2.7-6 6-6s6 2.7 6 6"
            stroke="#2F8F5B"
            strokeWidth="1.5"
            fill="#B8E6C8"
          />
        </svg>
      );
    case "region-spend-intensity":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#D1FAE5" />
          <path
            d="M16 8c-2 4-6 5-6 9a6 6 0 0 0 12 0c0-4-4-5-6-9Z"
            fill="#34D399"
          />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#047857"
            fontSize="6"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "region-top-share":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#FFF4E8" />
          <path d="M16 5v11h11" fill="#F97316" />
          <path d="M16 16 27 16A11 11 0 0 1 16 5Z" fill="#FDBA74" />
        </svg>
      );
    case "region-priority":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#FEE2E2" />
          <path
            d="M16 9v10M16 23v1"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 11h8l-1 9h-6l-1-9Z"
            fill="#F87171"
            stroke="#DC2626"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "detail-region-carbon":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#E8F4FC" />
          <path
            d="M11 20l5-8 5 8H11Z"
            fill="#7EC8E8"
            stroke="#2B7CB8"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <text
            x="16"
            y="19"
            textAnchor="middle"
            fill="#2B7CB8"
            fontSize="5"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "detail-national-rank":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#FEF3C7" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#CA8A04"
            fontSize="12"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            #
          </text>
        </svg>
      );
    case "detail-sido-rank":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#E0E7FF" />
          <rect x="10" y="11" width="12" height="10" rx="2" fill="#818CF8" />
          <path d="M13 15h6M13 18h4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "detail-spend-intensity":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#D1FAE5" />
          <path
            d="M16 8c-2 4-6 5-6 9a6 6 0 0 0 12 0c0-4-4-5-6-9Z"
            fill="#34D399"
          />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#047857"
            fontSize="6"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "ai-total-carbon":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#E8F4FC" />
          <ellipse cx="16" cy="17" rx="7" ry="5" fill="#7EC8E8" />
          <ellipse cx="13" cy="15" rx="4" ry="3" fill="#B8E4F5" />
          <text
            x="16"
            y="19"
            textAnchor="middle"
            fill="#2B7CB8"
            fontSize="6"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            CO₂
          </text>
        </svg>
      );
    case "ai-national-rank":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#F3E8FF" />
          <path
            d="M11 20h10l-1.5-5.5H12.5L11 20Z"
            fill="#A78BFA"
            stroke="#7C3AED"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M13 14.5h6l-1-3.5h-4l-1 3.5Z"
            fill="#C4B5FD"
            stroke="#7C3AED"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <rect x="14.5" y="9" width="3" height="2" rx="0.5" fill="#7C3AED" />
        </svg>
      );
    case "ai-major-industry":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#E8F8EF" />
          <path
            d="M16 22V12M16 12c-2 0-3.5-1.5-3.5-3.5S14 5 16 5s3.5 1.5 3.5 3.5S18 12 16 12Z"
            stroke="#2F8F5B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 18c1.5-2 2.5-2.5 4-2.5s2.5.5 4 2.5"
            stroke="#5CB86A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "ai-trend":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#DBEAFE" />
          <path
            d="M9 20 14 15l4 4 6-8"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 11h3v3"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
