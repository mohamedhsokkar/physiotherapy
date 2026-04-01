import { SectionPlaceholder } from "./SectionPlaceholder";
function ReportsPage() {
  return <div className="space-y-6"><SectionPlaceholder title="Reports module not connected yet" description="Generating reports requires backend aggregation and export endpoints. Those are not available in the current server, so this page now reflects that instead of presenting fake downloadable files." /></div>;
}
export { ReportsPage };
