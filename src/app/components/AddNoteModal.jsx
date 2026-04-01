import { X } from "lucide-react";
function AddNoteModal({
  onClose,
  patient
}) {
  const handleSubmit = e => {
    e.preventDefault();
    onClose();
  };
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-foreground">Add Medical Note</h2>
        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">{patient && <div className="p-4 bg-accent rounded-lg">
        <label className="text-sm text-muted-foreground">Patient</label>
        <p className="text-foreground">{patient.fullName || patient.name}</p>
      </div>}<div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-foreground">Date</label>
            <input type="date" defaultValue="2026-03-26" className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block mb-2 text-foreground">Doctor</label>
            <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Dr. Sarah Johnson</option>
              <option>Dr. Michael Martinez</option>
              <option>Dr. Robert Brown</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-2 text-foreground">Note Type</label>
          <select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Assessment</option>
            <option>Treatment Note</option>
            <option>Progress Note</option>
            <option>Discharge Summary</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-foreground">Medical Note</label>
          <textarea rows={8} placeholder="Enter detailed medical notes, observations, treatment plan, and recommendations..." className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div><div className="flex items-center gap-3 pt-4 border-t border-border">
          <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Save Note</button>
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  </div>;
}
export { AddNoteModal };
