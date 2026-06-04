import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
};

export function PageShell({ title, children }: PageShellProps) {
  return (
    <main className="page-shell">
      <header className="page-shell__header">
        <h1 className="page-shell__title">{title}</h1>
      </header>
      <div className="page-shell__body">{children}</div>
    </main>
  );
}
