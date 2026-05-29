interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}

export function SectionHeader({ eyebrow, title, children }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-river">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-bold tracking-normal text-ink dark:text-white sm:text-3xl">{title}</h1>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
