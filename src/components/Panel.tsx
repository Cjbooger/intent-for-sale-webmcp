import type { ReactNode } from "react";

export function Panel({ title, eyebrow, action, children, className = "" }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{eyebrow && <span className="panel-eyebrow">{eyebrow}</span>}</div>{action}</div>{children}</section>;
}

export function SectionLabel({ children }: { children: ReactNode }) { return <h3 className="section-label">{children}</h3>; }
