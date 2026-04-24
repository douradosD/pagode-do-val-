import type { ReactNode } from 'react';

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">{title}</h2>
      {description ? <div className="mt-4 text-base text-slate-300">{description}</div> : null}
    </div>
  );
}
