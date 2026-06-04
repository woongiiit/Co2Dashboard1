type CoverNavIconVariant = "region" | "industry" | "ai-consulting";

type CoverNavIconProps = {
  variant: CoverNavIconVariant;
};

export function CoverNavIcon({ variant }: CoverNavIconProps) {
  switch (variant) {
    case "region":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="15" fill="#6BB8E8" />
          <path
            d="M24 9c-5.2 3.8-8 8.8-8 13.5S18.8 32.2 24 36c5.2-3.8 8-8.8 8-13.5S29.2 12.8 24 9Z"
            fill="#5CB86A"
          />
          <path
            d="M16 24c-2.4 2.6-3.6 5.8-3.6 8.5 2.8-1.2 5.4-3.2 7.2-5.8-1.4-1-2.4-2.2-3.6-2.7Zm16 0c-1.2.5-2.2 1.7-3.6 2.7 1.8 2.6 4.4 4.6 7.2 5.8 0-2.7-1.2-5.9-3.6-8.5Z"
            fill="#4DAF5A"
          />
          <ellipse
            cx="24"
            cy="24"
            rx="15"
            ry="15"
            stroke="#4A9FD4"
            strokeWidth="1.25"
          />
          <path
            d="M9 24h30M24 9v30"
            stroke="#fff"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
        </svg>
      );
    case "industry":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect
            x="10"
            y="24"
            width="8"
            height="14"
            rx="2.5"
            fill="#F48FB1"
          />
          <rect
            x="20"
            y="16"
            width="8"
            height="22"
            rx="2.5"
            fill="#64B5F6"
          />
          <rect
            x="30"
            y="20"
            width="8"
            height="18"
            rx="2.5"
            fill="#FFD54F"
          />
        </svg>
      );
    case "ai-consulting":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            fill="#2E9B62"
            d="M23.2 8.8 15.8 21.5h5.9l-2.6 9.8 11.9-4.6-5.1-7.9h5.9L23.2 8.8Z"
          />
          <path
            fill="#2E9B62"
            d="M23.2 8.8 15.8 21.5h5.9l-2.6 9.8 11.9-4.6-5.1-7.9h5.9L23.2 8.8Z"
            transform="rotate(120 24 24)"
          />
          <path
            fill="#2E9B62"
            d="M23.2 8.8 15.8 21.5h5.9l-2.6 9.8 11.9-4.6-5.1-7.9h5.9L23.2 8.8Z"
            transform="rotate(240 24 24)"
          />
        </svg>
      );
  }
}

export type { CoverNavIconVariant };
