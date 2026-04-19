import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PatientProfile } from "./PatientProfile";
import { RouteBreadcrumbs } from "./RouteBreadcrumbs";
import { api } from "../lib/api";

function PatientProfilePage({ token, onOpenModal, refreshKey }) {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadPatient = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.getPatientById(token, patientId);

        if (!isCancelled) {
          setPatient(response.data);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load patient"
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPatient();

    return () => {
      isCancelled = true;
    };
  }, [patientId, token]);

  return (
    <div className="space-y-6">
      <RouteBreadcrumbs
        items={[
          { label: "Patients", to: "/patients" },
          { label: patient?.fullName || "Patient Profile" }
        ]}
      />

      {isLoading ? (
        <div className="rounded-lg border border-border bg-white px-6 py-10 text-sm text-muted-foreground">
          Loading patient...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : patient ? (
        <PatientProfile
          token={token}
          patient={patient}
          onBack={() => navigate("/patients")}
          onOpenModal={onOpenModal}
          onOpenVisit={(visit) => navigate(`/visits/${visit._id}`)}
          refreshKey={refreshKey}
        />
      ) : null}
    </div>
  );
}

export { PatientProfilePage };
