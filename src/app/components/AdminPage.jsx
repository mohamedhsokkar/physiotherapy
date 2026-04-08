import { useEffect, useMemo, useState } from "react";
import { Plus, Shield, Stethoscope, UserCheck, UserX, Users } from "lucide-react";
import { api } from "../lib/api";

function AdminPage({
  token,
  user,
  onOpenModal,
  refreshKey
}) {
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    role: "",
    isActive: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const canManageUsers = user?.role === "admin";

  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.getUsers(token, filters);
        if (!isCancelled) {
          setStaff(response.data);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load staff");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isCancelled = true;
    };
  }, [filters, refreshKey, token]);

  const summary = useMemo(() => ({
    total: staff.length,
    admins: staff.filter(member => member.role === "admin").length,
    doctors: staff.filter(member => member.role === "doctor").length,
    active: staff.filter(member => member.isActive).length,
    inactive: staff.filter(member => !member.isActive).length
  }), [staff]);

  const summaryCards = [{
    label: "Total staff",
    value: summary.total,
    icon: Users
  }, {
    label: "Admins",
    value: summary.admins,
    icon: Shield
  }, {
    label: "Doctors",
    value: summary.doctors,
    icon: Stethoscope
  }, {
    label: "Active users",
    value: summary.active,
    icon: UserCheck
  }, {
    label: "Inactive users",
    value: summary.inactive,
    icon: UserX
  }];

  return <div className="space-y-6"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-foreground">Admin</h2><p className="text-sm text-muted-foreground">Manage clinic staff accounts using the current auth endpoints. Editing, password reset, and activity logs still need backend support.</p></div>{canManageUsers ? <button onClick={() => onOpenModal("addUser")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"><Plus className="h-5 w-5" /><span>Add User</span></button> : null}</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">{summaryCards.map(card => {
        const Icon = card.icon;
        return <div key={card.label} className="rounded-lg border border-border bg-white p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{card.label}</p><Icon className="h-5 w-5 text-primary" /></div><p className="mt-3 text-3xl text-foreground">{isLoading ? "..." : card.value}</p></div>;
      })}</div><div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-2"><div><label className="mb-2 block text-sm text-foreground">Role</label><select value={filters.role} onChange={event => setFilters(current => ({
              ...current,
              role: event.target.value
            }))} className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"><option value="">All roles</option><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="receptionist">Receptionist</option></select></div><div><label className="mb-2 block text-sm text-foreground">Status</label><select value={filters.isActive} onChange={event => setFilters(current => ({
              ...current,
              isActive: event.target.value
            }))} className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></div></div>{!canManageUsers ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">You can review staff accounts, but only admins can create new users.</div> : null}{error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}<div className="overflow-x-auto rounded-lg border border-border bg-white"><table className="w-full"><thead className="border-b border-border bg-accent"><tr><th className="px-4 py-4 text-left text-foreground md:px-6">Name</th><th className="px-4 py-4 text-left text-foreground md:px-6">Email</th><th className="px-4 py-4 text-left text-foreground md:px-6">Role</th><th className="px-4 py-4 text-left text-foreground md:px-6">Status</th><th className="px-4 py-4 text-left text-foreground md:px-6">Created</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">Loading staff...</td></tr> : staff.length === 0 ? <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">No staff members found.</td></tr> : staff.map(member => <tr key={member._id} className="border-b border-border transition-colors hover:bg-accent/40"><td className="px-4 py-4 md:px-6"><p className="text-sm text-foreground">{member.name}</p><p className="mt-1 text-xs text-muted-foreground">{member._id}</p></td><td className="px-4 py-4 text-sm text-muted-foreground md:px-6">{member.email}</td><td className="px-4 py-4 md:px-6"><span className="rounded-full bg-accent px-3 py-1 text-xs capitalize text-muted-foreground">{member.role}</span></td><td className="px-4 py-4 md:px-6"><span className={`rounded-full px-3 py-1 text-xs ${member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{member.isActive ? "Active" : "Inactive"}</span></td><td className="px-4 py-4 text-sm text-muted-foreground md:px-6">{new Date(member.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>;
}
export { AdminPage };
