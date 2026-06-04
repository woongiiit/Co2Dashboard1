"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { NavigationOverlay } from "@/components/common/NavigationOverlay";

type NavigatingLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  loadingMessage?: string;
};

export function NavigatingLink({
  href,
  className,
  children,
  loadingMessage,
}: NavigatingLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
  }, []);

  return (
    <>
      {isNavigating ? <NavigationOverlay message={loadingMessage} /> : null}
      <Link href={href} className={className} onClick={handleNavigateStart}>
        {children}
      </Link>
    </>
  );
}
