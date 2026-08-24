"use client";

import { buildCarbonEquivalentMessages } from "@/lib/carbon/carbon-equivalents";

type CarbonTreeEquivalentHintProps = {
  tco2eq: number;
};

function TreeIcon() {
  return (
    <svg
      className="carbon-tree-hint__icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 3.5 6.5 9h2.75L8 14.5 10 12l2 2.5-1.25-5.5H13.5L10 3.5Z"
        fill="currentColor"
      />
      <path d="M8.5 15.5h3v2h-3v-2Z" fill="currentColor" />
    </svg>
  );
}

export function CarbonTreeEquivalentHint({ tco2eq }: CarbonTreeEquivalentHintProps) {
  const messages = buildCarbonEquivalentMessages(tco2eq);
  const ariaLabel = messages.join(" ");

  if (messages.length === 0) return null;

  return (
    <span className="carbon-tree-hint">
      <button
        type="button"
        className="carbon-tree-hint__trigger"
        aria-label={ariaLabel}
      >
        <TreeIcon />
      </button>
      <span className="carbon-tree-hint__tooltip" role="tooltip">
        <ul className="carbon-tree-hint__list">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
        <p className="carbon-tree-hint__note">참고 환산 (배출·흡수 계수 가정)</p>
      </span>
    </span>
  );
}
