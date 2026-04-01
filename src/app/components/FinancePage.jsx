import { SectionPlaceholder } from "./SectionPlaceholder";
function FinancePage({
  onOpenModal: _onOpenModal
}) {
  return <div className="space-y-6"><SectionPlaceholder title="Finance module not connected yet" description="This section was previously mock data. The backend still needs expenses, payments, invoices, totals, and reporting endpoints before a real finance UI can be wired." /><div className="rounded-lg border border-border bg-white p-6"><p className="text-sm text-muted-foreground">The add-expense modal is intentionally hidden from the live workflow until the server has a finance module.</p></div></div>;
}
export { FinancePage };
