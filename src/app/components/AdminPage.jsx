import { SectionPlaceholder } from "./SectionPlaceholder";
function AdminPage({
  onOpenModal: _onOpenModal
}) {
  return <div className="space-y-6"><SectionPlaceholder title="Admin module not connected yet" description="The backend currently has auth and patients APIs only. To make this page live, the server still needs user listing, creation, updates, activation/deactivation, and activity endpoints." /><div className="rounded-lg border border-border bg-white p-6"><p className="text-sm text-muted-foreground">The add-user modal is intentionally not exposed here yet because it still collects fields the server does not accept.</p></div></div>;
}
export { AdminPage };
