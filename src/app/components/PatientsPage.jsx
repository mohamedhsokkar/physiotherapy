import { useEffect, useState } from "react";
import { Eye, Phone, Plus, Search, UserRound } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";
function PatientsPage({
  token,
  onNavigate,
  onOpenModal
}) {
  const {
    t,
    isRTL
  } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isCancelled = false;
    const loadPatients = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.getPatients(token, search);
        if (!isCancelled) {
          setPatients(response.data.patients);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load patients");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    const timeoutId = window.setTimeout(loadPatients, 250);
    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [search, token]);
  return <div className="space-y-6"><div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${isRTL ? "sm:flex-row-reverse" : ""}`}><div className="relative flex-1 max-w-md"><Search className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} /><input type="text" value={search} onChange={event => setSearch(event.target.value)} placeholder={t("patients.searchPatients")} className={`w-full rounded-lg border border-border bg-accent py-2 ${isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"} focus:outline-none focus:ring-2 focus:ring-ring`} /></div><button onClick={() => onOpenModal("addPatient")} className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90 ${isRTL ? "flex-row-reverse" : ""}`}><Plus className="h-5 w-5" /><span>{t("patients.addPatient")}</span></button></div>{error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}<div className="overflow-x-auto rounded-lg border border-border bg-white"><table className="w-full"><thead className="border-b border-border bg-accent"><tr><th className={`px-4 py-4 md:px-6 ${isRTL ? "text-right" : "text-left"} text-foreground`}>{t("patients.name")}</th><th className={`px-4 py-4 md:px-6 ${isRTL ? "text-right" : "text-left"} text-foreground`}>{t("patients.phone")}</th><th className={`hidden px-4 py-4 md:px-6 lg:table-cell ${isRTL ? "text-right" : "text-left"} text-foreground`}>Gender</th><th className={`hidden px-4 py-4 md:px-6 xl:table-cell ${isRTL ? "text-right" : "text-left"} text-foreground`}>Created</th><th className={`px-4 py-4 md:px-6 ${isRTL ? "text-left" : "text-right"} text-foreground`}>{t("patients.actions")}</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">Loading patients...</td></tr> : patients.length === 0 ? <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">No patients found.</td></tr> : patients.map(patient => <tr className="border-b border-border transition-colors hover:bg-accent/50" key={patient._id}><td className={`px-4 py-4 md:px-6 ${isRTL ? "text-right" : ""}`}><div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></div><div><p className="text-foreground">{patient.fullName}</p><p className="text-xs text-muted-foreground">Added by {patient.createdBy?.name || "Unknown"}</p></div></div></td><td className={`px-4 py-4 md:px-6 ${isRTL ? "text-right" : ""}`}><div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}><Phone className="h-4 w-4" /><span>{patient.phone}</span></div></td><td className={`hidden px-4 py-4 md:px-6 lg:table-cell ${isRTL ? "text-right" : ""}`}><span className="text-sm capitalize text-muted-foreground">{patient.gender}</span></td><td className={`hidden px-4 py-4 md:px-6 xl:table-cell ${isRTL ? "text-right" : ""}`}><span className="text-sm text-muted-foreground">{new Date(patient.createdAt).toLocaleDateString()}</span></td><td className={`px-4 py-4 md:px-6 ${isRTL ? "text-left" : "text-right"}`}><button onClick={() => onNavigate("patientProfile", {
                patientId: patient._id,
                patient
              })} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-primary transition-colors hover:bg-accent ${isRTL ? "flex-row-reverse" : ""}`}><Eye className="h-4 w-4" /><span className="hidden sm:inline">{t("patients.view")}</span></button></td></tr>)}</tbody></table></div></div>;
}
export { PatientsPage };
