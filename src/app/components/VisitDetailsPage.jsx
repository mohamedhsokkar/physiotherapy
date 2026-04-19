import { ArrowLeft, Calendar, CreditCard, FileText, Stethoscope, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { RouteBreadcrumbs } from "./RouteBreadcrumbs";
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
  return value?.replace(/_/g, " ") || "Visit";
}

function VisitDetailsPage({ token }) {
  const navigate = useNavigate();
  const { visitId } = useParams();
  const [visit, setVisit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadVisit = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.getVisitById(token, visitId);

        if (!isCancelled) {
          setVisit(response.data);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load visit");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadVisit();

    return () => {
      isCancelled = true;
    };
  }, [token, visitId]);

  const title = visit ? `${visit.patient?.fullName || "Patient"} visit` : "Visit Details";

  return (
    <div className="space-y-6">
      <RouteBreadcrumbs
        items={[
          { label: "Visits", to: "/visits" },
          { label: title }
        ]}
      />

      <button
        onClick={() => navigate("/visits")}
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Visits</span>
      </button>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-white px-6 py-10 text-sm text-muted-foreground">
          Loading visit...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : visit ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-foreground">{formatVisitType(visit.visitType)}</h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.visitDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-accent px-3 py-1 capitalize text-muted-foreground">
                    {visit.status}
                  </span>
                  <span className="rounded-full bg-accent px-3 py-1 capitalize text-muted-foreground">
                    {visit.paymentStatus}
                  </span>
                </div>
              </div>

              {visit.patient?._id ? (
                <Link
                  to={`/patients/${visit.patient._id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open Patient Record
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                <h3 className="text-foreground">Patient</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">{visit.patient?.fullName || "Unknown patient"}</p>
                <p className="text-muted-foreground">{visit.patient?.phone || "No phone"}</p>
                <p className="capitalize text-muted-foreground">
                  {visit.patient?.gender || "Unknown gender"}
                </p>
                {visit.patient?.address ? (
                  <p className="text-muted-foreground">{visit.patient.address}</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="text-foreground">Care Team</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">Doctor: {visit.doctor?.name || "Unassigned"}</p>
                <p className="text-muted-foreground">
                  Registered by: {visit.registeredBy?.name || "Unknown"}
                </p>
                <p className="text-muted-foreground">
                  Contact: {visit.doctor?.email || "No email"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-foreground">Payment</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-accent/40 p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="mt-1 text-foreground">{formatCurrency(visit.totalAmount)}</p>
                </div>
                <div className="rounded-lg bg-accent/40 p-4">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 text-foreground">{formatCurrency(visit.amountPaid)}</p>
                </div>
                <div className="rounded-lg bg-accent/40 p-4">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="mt-1 text-foreground">
                    {formatCurrency((visit.totalAmount || 0) - (visit.amountPaid || 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-foreground">Clinical Notes</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Chief complaint
                  </p>
                  <p className="text-foreground">{visit.chiefComplaint || "Not recorded."}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Clinical notes
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">
                    {visit.clinicalNotes || "Not recorded."}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Treatment plan
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">
                    {visit.treatmentPlan || "Not recorded."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { VisitDetailsPage };
