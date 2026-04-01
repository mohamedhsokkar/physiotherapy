import { useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";
const initialForm = {
  fullName: "",
  phone: "",
  gender: "male",
  dateOfBirth: "",
  address: "",
  notes: ""
};
function AddPatientModal({
  token,
  onClose,
  onCreated
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value
    }));
  };
  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await api.createPatient(token, {
        ...form,
        dateOfBirth: form.dateOfBirth || void 0,
        address: form.address?.trim() || void 0,
        notes: form.notes?.trim() || void 0
      });
      onCreated(response.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create patient");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"><div className="flex items-center justify-between border-b border-border p-6"><h2 className="text-foreground">Add New Patient</h2><button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-accent"><X className="h-5 w-5 text-muted-foreground" /></button></div><form onSubmit={handleSubmit} className="space-y-6 p-6"><div><h3 className="mb-4 text-foreground">Server-supported fields</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label className="mb-2 block text-foreground">Full Name</label><input type="text" value={form.fullName} onChange={event => handleChange("fullName", event.target.value)} placeholder="John Smith" className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" required /></div><div><label className="mb-2 block text-foreground">Gender</label><select value={form.gender} onChange={event => handleChange("gender", event.target.value)} className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"><option value="male">Male</option><option value="female">Female</option></select></div><div><label className="mb-2 block text-foreground">Phone</label><input type="tel" value={form.phone} onChange={event => handleChange("phone", event.target.value)} placeholder="(555) 123-4567" className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" required /></div><div><label className="mb-2 block text-foreground">Date of Birth</label><input type="date" value={form.dateOfBirth || ""} onChange={event => handleChange("dateOfBirth", event.target.value)} className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" /></div></div></div><div><label className="mb-2 block text-foreground">Address</label><input type="text" value={form.address || ""} onChange={event => handleChange("address", event.target.value)} placeholder="123 Main Street" className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" /></div><div><label className="mb-2 block text-foreground">Notes</label><textarea value={form.notes || ""} onChange={event => handleChange("notes", event.target.value)} rows={4} placeholder="Optional intake notes" className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" /></div>{error ? <p className="text-sm text-red-600">{error}</p> : null}<div className="flex items-center gap-3 border-t border-border pt-4"><button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Saving..." : "Add Patient"}</button><button type="button" onClick={onClose} className="flex-1 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-colors hover:bg-accent/80">Cancel</button></div></form></div></div>;
}
export { AddPatientModal };
