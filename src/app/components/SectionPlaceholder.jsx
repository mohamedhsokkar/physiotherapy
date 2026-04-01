function SectionPlaceholder({
  title,
  description
}) {
  return <div className="rounded-lg border border-dashed border-border bg-white p-6"><h3 className="text-foreground">{title}</h3><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>;
}
export { SectionPlaceholder };
