import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";

function AddVisitModal({
  token,
  patient,
  onClose,
  onCreated
}) {
  const [patients, setPatients] = useState(patient ? [patient] : []);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient: patient?._id || "",
    doctor: "",
    visitDate: new Date().toISOString().slice(0, 16),
    visitType: "session",
    status: "completed",
    chiefComplaint: "",
    clinicalNotes: "",
    treatmentPlan: "",
    totalAmount: "",
    amountPaid: ""
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setError("");

      try {
        const requests = [api.getUsers(token, { role: "doctor", isActive: true })];

        if (!patient) {
          requests.push(api.getPatients(token, "", { limit: 100 }));
        }

        const results = await Promise.all(requests);

        if (!isCancelled) {
          setDoctors(results[0].data);

          if (!patient) {
            setPatients(results[1].data.patients);
          }
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load visit form options"
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isCancelled = true;
    };
  }, [patient, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.createVisit(token, {
        patient: form.patient,
        doctor: form.doctor,
        visitDate: new Date(form.visitDate).toISOString(),
        visitType: form.visitType,
        status: form.status,
        chiefComplaint: form.chiefComplaint.trim(),
        clinicalNotes: form.clinicalNotes.trim(),
        treatmentPlan: form.treatmentPlan.trim(),
        totalAmount: Number(form.totalAmount),
        amountPaid: form.amountPaid === "" ? 0 : Number(form.amountPaid)
      });

      onCreated?.(response.data);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to create visit"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-foreground">Add Visit</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!patient ? (
            <div>
              <label className="mb-2 block text-foreground">Patient</label>
              <select
                name="patient"
                value={form.patient}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={isLoadingOptions}
              >
                <option value="">Select patient</option>
                {patients.map((entry) => (
                  <option key={entry._id} value={entry._id}>
                    {entry.fullName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-lg bg-accent p-4">
              <label className="text-sm text-muted-foreground">Patient</label>
              <p className="text-foreground">{patient.fullName}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-foreground">Visit date & time</label>
              <input
                type="datetime-local"
                name="visitDate"
                value={form.visitDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-foreground">Doctor</label>
              <select
                name="doctor"
                value={form.doctor}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={isLoadingOptions}
              >
                <option value="">Select doctor</option>
                {doctors.map((entry) => (
                  <option key={entry._id} value={entry._id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-foreground">Visit type</label>
              <select
                name="visitType"
                value={form.visitType}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="consultation">Consultation</option>
                <option value="session">Session</option>
                <option value="follow_up">Follow up</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-foreground">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-foreground">Chief complaint</label>
            <input
              type="text"
              name="chiefComplaint"
              value={form.chiefComplaint}
              onChange={handleChange}
              placeholder="Reason for visit"
              className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-foreground">Clinical notes</label>
            <textarea
              rows={4}
              name="clinicalNotes"
              value={form.clinicalNotes}
              onChange={handleChange}
              placeholder="Observations and notes"
              className="w-full resize-none rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-foreground">Treatment plan</label>
            <textarea
              rows={3}
              name="treatmentPlan"
              value={form.treatmentPlan}
              onChange={handleChange}
              placeholder="Planned treatment"
              className="w-full resize-none rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-foreground">Total amount</label>
              <input
                type="number"
                name="totalAmount"
                value={form.totalAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-foreground">Amount paid</label>
              <input
                type="number"
                name="amountPaid"
                value={form.amountPaid}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingOptions}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Visit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-colors hover:bg-accent/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { AddVisitModal };
