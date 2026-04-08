import { useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";

function AddUserModal({
  token,
  onClose,
  onCreated
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "receptionist",
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = event => {
    const {
      name,
      value
    } = event.target;
    setFormData(current => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await api.createUser(token, formData);
      onCreated?.();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white shadow-xl"><div className="flex items-center justify-between border-b border-border p-6"><div><h2 className="text-foreground">Add New User</h2><p className="mt-1 text-sm text-muted-foreground">Creates a staff account through the existing <code>/api/auth/register</code> endpoint.</p></div><button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-accent"><X className="h-5 w-5 text-muted-foreground" /></button></div><form onSubmit={handleSubmit} className="space-y-6 p-6"><div><label className="mb-2 block text-foreground">Full name</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" /></div><div><label className="mb-2 block text-foreground">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john.doe@clinic.com" required className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" /></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label className="mb-2 block text-foreground">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="receptionist">Receptionist</option></select></div><div><label className="mb-2 block text-foreground">Status</label><select value={formData.isActive ? "active" : "inactive"} onChange={event => setFormData(current => ({
                ...current,
                isActive: event.target.value === "active"
              }))} className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div><div><label className="mb-2 block text-foreground">Temporary password</label><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" minLength={6} required className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring" /><p className="mt-1 text-xs text-muted-foreground">The current backend stores the password directly and does not support first-login reset yet.</p></div>{error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}<div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row"><button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating..." : "Add User"}</button><button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button></div></form></div></div>;
}
export { AddUserModal };
