interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      )}
    </div>
  );
}
