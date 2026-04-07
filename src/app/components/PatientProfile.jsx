import { ArrowLeft, Calendar, FileText, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function formatVisitType(value) {
  return value.replace(/_/g, " ");
}

function PatientProfile({
  token,
  patient,
  onBack,
  onOpenModal,
  refreshKey
}) {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("info");
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [visitsError, setVisitsError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadVisits = async () => {
      setVisitsLoading(true);
      setVisitsError("");

      try {
        const response = await api.getVisits(token, {
          patient: patient._id,
          limit: 50
        });

        if (!isCancelled) {
          setVisits(response.data.visits);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setVisitsError(
            loadError instanceof Error ? loadError.message : "Failed to load visits"
          );
        }
      } finally {
        if (!isCancelled) {
          setVisitsLoading(false);
        }
      }
    };

    loadVisits();

    return () => {
      isCancelled = true;
    };
  }, [patient._id, refreshKey, token]);

  const visitContent = (
    <div className="space-y-4">
      <div
        className={`flex items-center justify-between ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <h3 className="text-foreground">{t("profile.visits")}</h3>
        <button
          onClick={() => onOpenModal("addVisit", { patient })}
          className={`rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          {t("profile.addVisit")}
        </button>
      </div>

      {visitsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {visitsError}
        </div>
      ) : null}

      {visitsLoading ? (
        <div className="rounded-lg border border-border bg-accent/30 p-4 text-sm text-muted-foreground">
          Loading visits...
        </div>
      ) : visits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-accent/40 p-4 text-sm text-muted-foreground">
          No visits recorded for this patient yet.
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <div
              key={visit._id}
              className="rounded-lg border border-border bg-white px-4 py-3"
            >
              <div
                className={`flex items-start justify-between gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-sm text-foreground">
                    {new Date(visit.visitDate).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {formatVisitType(visit.visitType)} with {visit.doctor?.name || "Unknown doctor"}
                  </p>
                </div>
                <span className="rounded-full bg-accent px-2 py-1 text-xs capitalize text-muted-foreground">
                  {visit.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2">
                <p>Payment: {visit.paymentStatus}</p>
                <p>Total: {formatCurrency(visit.totalAmount)}</p>
                <p>Paid: {formatCurrency(visit.amountPaid)}</p>
                <p>Complaint: {visit.chiefComplaint || "Not recorded"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const paymentContent = (
    <div className="space-y-3">
      {visitsLoading ? (
        <div className="rounded-lg border border-border bg-accent/30 p-4 text-sm text-muted-foreground">
          Loading payments...
        </div>
      ) : visits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-accent/40 p-4 text-sm text-muted-foreground">
          No visit payments available yet.
        </div>
      ) : (
        visits.map((visit) => (
          <div
            key={visit._id}
            className="rounded-lg border border-border bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-foreground">
                  {new Date(visit.visitDate).toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {visit.paymentStatus}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground">
                  {formatCurrency(visit.amountPaid)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  of {formatCurrency(visit.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>{t("profile.back")}</span>
      </button>

      <div className="rounded-lg border border-border bg-white p-4 md:p-6">
        <div
          className={`mb-6 flex flex-col items-start justify-between gap-4 md:flex-row ${
            isRTL ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h2 className="mb-2 text-foreground">{patient.fullName}</h2>
              <div className="space-y-1">
                <p
                  className={`flex items-center gap-2 text-sm text-muted-foreground ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>{patient.phone}</span>
                </p>
                <p
                  className={`flex items-center gap-2 text-sm text-muted-foreground ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created: {new Date(patient.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-accent px-4 py-2 text-sm text-muted-foreground">
            Live data from <code>/api/patients/:id</code> and <code>/api/visits</code>
          </div>
        </div>

        <div className="overflow-x-auto border-b border-border">
          <div className={`flex min-w-max gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            {[
              { id: "info", label: t("profile.info") },
              { id: "visits", label: t("profile.visits") },
              { id: "notes", label: t("profile.medicalNotes") },
              { id: "payments", label: t("profile.payments") }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "info" ? (
            <div className="space-y-6">
              <div>
                <h3 className={`mb-4 text-foreground ${isRTL ? "text-right" : ""}`}>
                  {t("profile.contactInfo")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="mb-1 text-xs text-muted-foreground">{t("profile.phone")}</p>
                    <p className="text-sm text-foreground">{patient.phone}</p>
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="mb-1 text-xs text-muted-foreground">Gender</p>
                    <p className="text-sm capitalize text-foreground">{patient.gender}</p>
                  </div>
                  <div className={`md:col-span-2 ${isRTL ? "text-right" : ""}`}>
                    <p className="mb-1 text-xs text-muted-foreground">{t("profile.address")}</p>
                    <p className="text-sm text-foreground">
                      {patient.address || "No address saved."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`mb-4 text-foreground ${isRTL ? "text-right" : ""}`}>
                  {t("profile.medicalInfo")}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {t("profile.dateOfBirth")}
                    </p>
                    <p className="text-sm text-foreground">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="mb-1 text-xs text-muted-foreground">Record owner</p>
                    <p className="text-sm text-foreground">
                      {patient.createdBy?.name || "Unknown"}
                    </p>
                  </div>
                  <div className={`md:col-span-2 ${isRTL ? "text-right" : ""}`}>
                    <p className="mb-1 text-xs text-muted-foreground">{t("modal.notes")}</p>
                    <p className="text-sm text-foreground">
                      {patient.notes || "No notes saved."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "visits" ? visitContent : null}

          {activeTab === "notes" ? (
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <h3 className="text-foreground">{t("profile.medicalNotes")}</h3>
                <button
                  onClick={() => onOpenModal("addNote", { patient })}
                  className={`rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  {t("profile.addNote")}
                </button>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-accent/40 p-4 text-sm text-muted-foreground">
                <FileText className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Medical notes are still not connected to a backend module.</p>
              </div>
            </div>
          ) : null}

          {activeTab === "payments" ? paymentContent : null}
        </div>
      </div>
    </div>
  );
}

export { PatientProfile };
