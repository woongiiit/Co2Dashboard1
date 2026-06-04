type TravelerGuideIconProps = {
  id: string;
};

export function TravelerGuideIcon({ id }: TravelerGuideIconProps) {
  switch (id) {
    case "transport":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#DCFCE7" />
          <path
            d="M8 18h16l-1.5-5H9.5L8 18Z"
            fill="#4ADE80"
            stroke="#16A34A"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path d="M11 13h10l-1-3h-8l-1 3Z" fill="#86EFAC" />
        </svg>
      );
    case "lodging":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#DCFCE7" />
          <rect x="9" y="12" width="14" height="10" rx="1.5" fill="#4ADE80" />
          <path d="M11 12V10a5 5 0 0 1 10 0v2" stroke="#16A34A" strokeWidth="1.2" />
        </svg>
      );
    case "food":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#DCFCE7" />
          <path
            d="M11 11v10M11 11c0-1.5 1-2.5 2.5-2.5M13.5 11V9M11 21h3"
            stroke="#16A34A"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M19 9v12M19 9c1.5 0 2.5 1 2.5 2.5v2c0 1.5-1 2.5-2.5 2.5"
            stroke="#16A34A"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "waste":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#DCFCE7" />
          <path
            d="M12 13h8l-.8 10H12.8L12 13Z"
            fill="#86EFAC"
            stroke="#16A34A"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path d="M13 13V11h6v2" stroke="#16A34A" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M14 16h4M14 19h4" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "activity":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#DCFCE7" />
          <ellipse cx="16" cy="22" rx="3" ry="1.2" fill="#86EFAC" />
          <circle cx="16" cy="11" r="2.5" fill="#4ADE80" />
          <path
            d="M16 13.5v5M13.5 18.5l2.5 2 2.5-2"
            stroke="#16A34A"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#DCFCE7" />
        </svg>
      );
  }
}
