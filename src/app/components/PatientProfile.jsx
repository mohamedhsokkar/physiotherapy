import { ArrowLeft, Calendar, FileText, Phone, User } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
function PatientProfile({
  patient,
  onBack,
  onOpenModal
}) {
  const {
    t,
    isRTL
  } = useLanguage();
  const [activeTab, setActiveTab] = useState("info");
  return <div className="space-y-6"><button onClick={onBack} className={`flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground ${isRTL ? "flex-row-reverse" : ""}`}><ArrowLeft className="h-5 w-5" /><span>{t("profile.back")}</span></button><div className="rounded-lg border border-border bg-white p-4 md:p-6"><div className={`mb-6 flex flex-col items-start justify-between gap-4 md:flex-row ${isRTL ? "md:flex-row-reverse" : ""}`}><div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"><User className="h-8 w-8 text-primary-foreground" /></div><div className={isRTL ? "text-right" : ""}><h2 className="mb-2 text-foreground">{patient.fullName}</h2><div className="space-y-1"><p className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}><Phone className="h-4 w-4" /><span>{patient.phone}</span></p><p className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}><Calendar className="h-4 w-4" /><span>Created: {new Date(patient.createdAt).toLocaleDateString()}</span></p></div></div></div><div className="rounded-lg bg-accent px-4 py-2 text-sm text-muted-foreground">Live data from `/api/patients/:id`</div></div><div className="overflow-x-auto border-b border-border"><div className={`flex min-w-max gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>{[{
            id: "info",
            label: t("profile.info")
          }, {
            id: "visits",
            label: t("profile.visits")
          }, {
            id: "notes",
            label: t("profile.medicalNotes")
          }, {
            id: "payments",
            label: t("profile.payments")
          }].map(tab => <button onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap px-4 py-3 transition-colors ${activeTab === tab.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`} key={tab.id}>{tab.label}</button>)}</div></div><div className="mt-6">{activeTab === "info" ? <div className="space-y-6"><div><h3 className={`mb-4 text-foreground ${isRTL ? "text-right" : ""}`}>{t("profile.contactInfo")}</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className={isRTL ? "text-right" : ""}><p className="mb-1 text-xs text-muted-foreground">{t("profile.phone")}</p><p className="text-sm text-foreground">{patient.phone}</p></div><div className={isRTL ? "text-right" : ""}><p className="mb-1 text-xs text-muted-foreground">Gender</p><p className="text-sm capitalize text-foreground">{patient.gender}</p></div><div className={`md:col-span-2 ${isRTL ? "text-right" : ""}`}><p className="mb-1 text-xs text-muted-foreground">{t("profile.address")}</p><p className="text-sm text-foreground">{patient.address || "No address saved."}</p></div></div></div><div><h3 className={`mb-4 text-foreground ${isRTL ? "text-right" : ""}`}>{t("profile.medicalInfo")}</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className={isRTL ? "text-right" : ""}><p className="mb-1 text-xs text-muted-foreground">{t("profile.dateOfBirth")}</p><p className="text-sm text-foreground">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not provided"}</p></div><div className={isRTL ? "text-right" : ""}><p className="mb-1 text-xs text-muted-foreground">Record owner</p><p className="text-sm text-foreground">{patient.createdBy?.name || "Unknown"}</p></div><div className={`md:col-span-2 ${isRTL ? "text-right" : ""}`}><p className="mb-1 text-xs text-muted-foreground">{t("modal.notes")}</p><p className="text-sm text-foreground">{patient.notes || "No notes saved."}</p></div></div></div></div> : null}{activeTab === "visits" ? <div className="space-y-4"><div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}><h3 className="text-foreground">{t("profile.visits")}</h3><button onClick={() => onOpenModal("addVisit", {
              patient
            })} className={`rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 ${isRTL ? "flex-row-reverse" : ""}`}>{t("profile.addVisit")}</button></div><div className="rounded-lg border border-dashed border-border bg-accent/40 p-4 text-sm text-muted-foreground">Visit records are not available yet because the server does not expose a visits module.</div></div> : null}{activeTab === "notes" ? <div className="space-y-4"><div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}><h3 className="text-foreground">{t("profile.medicalNotes")}</h3><button onClick={() => onOpenModal("addNote", {
              patient
            })} className={`rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 ${isRTL ? "flex-row-reverse" : ""}`}>{t("profile.addNote")}</button></div><div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-accent/40 p-4 text-sm text-muted-foreground"><FileText className="mt-0.5 h-5 w-5 shrink-0" /><p>Medical notes are not available yet because the server does not expose a notes module.</p></div></div> : null}{activeTab === "payments" ? <div className="rounded-lg border border-dashed border-border bg-accent/40 p-4 text-sm text-muted-foreground">Payments are not available yet because the server does not expose a billing module.</div> : null}</div></div></div>;
}
export { PatientProfile };
