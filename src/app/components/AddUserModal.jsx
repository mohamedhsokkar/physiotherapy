import { X } from "lucide-react";
function AddUserModal({
  onClose
}) {
  const handleSubmit = e => {
    e.preventDefault();
    onClose();
  };
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between p-6 border-b border-border"><h2 className="text-foreground">Add New User</h2><button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button></div><form onSubmit={handleSubmit} className="p-6 space-y-6"><div className="grid grid-cols-2 gap-4"><div><label className="block mb-2 text-foreground">First Name</label><input type="text" placeholder="John" className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" /></div><div><label className="block mb-2 text-foreground">Last Name</label><input type="text" placeholder="Doe" className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" /></div></div><div><label className="block mb-2 text-foreground">Email</label><input type="email" placeholder="john.doe@clinic.com" className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block mb-2 text-foreground">Phone</label><input type="tel" placeholder="(555) 123-4567" className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" /></div><div><label className="block mb-2 text-foreground">Role</label><select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"><option>Doctor</option><option>Receptionist</option><option>Admin</option></select></div></div><div><label className="block mb-2 text-foreground">Status</label><select className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"><option>Active</option><option>Inactive</option></select></div><div><label className="block mb-2 text-foreground">Initial Password</label><input type="password" placeholder="Enter temporary password" className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring" /><p className="text-xs text-muted-foreground mt-1">User will be required to change password on first login</p></div><div><h4 className="text-foreground mb-3">Permissions</h4><div className="space-y-2">{[{
              id: "patients",
              label: "Manage Patients"
            }, {
              id: "visits",
              label: "Manage Visits"
            }, {
              id: "finance",
              label: "View Finance"
            }, {
              id: "reports",
              label: "Generate Reports"
            }, {
              id: "admin",
              label: "Admin Access"
            }].map(permission => <label className="flex items-center gap-2" key={permission.id}><input type="checkbox" className="w-4 h-4 rounded border-border" /><span className="text-sm text-foreground">{permission.label}</span></label>)}</div></div><div className="flex items-center gap-3 pt-4 border-t border-border"><button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Add User</button><button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">Cancel</button></div></form></div></div>;
}
export { AddUserModal };
