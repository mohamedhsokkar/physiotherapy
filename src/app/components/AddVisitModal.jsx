import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { api } from "../lib/api";

function AddVisitModal({
  token,
  patient,
  initialDate,
  onClose,
  onCreated
}) {
  const getInitialVisitDate = () => {
    if (!initialDate) {
      return new Date().toISOString().slice(0, 16);
    }

    const parsedDate = new Date(initialDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return new Date().toISOString().slice(0, 16);
    }

    return new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [patients, setPatients] = useState(patient ? [patient] : []);
  const [doctors, setDoctors] = useState([]);
  const [patientSearch, setPatientSearch] = useState(patient?.fullName || "");
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [form, setForm] = useState({
    patient: patient?._id || "",
    doctor: "",
    visitDate: getInitialVisitDate(),
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
  const patientPickerRef = useRef(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      patient: patient?._id || "",
      visitDate: getInitialVisitDate()
    }));
    setPatientSearch(patient?.fullName || "");
    setIsPatientListOpen(false);
  }, [initialDate, patient]);

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

  useEffect(() => {
    if (patient || !form.patient) {
      return;
    }

    const selectedPatient = patients.find((entry) => entry._id === form.patient);

    if (selectedPatient) {
      setPatientSearch(selectedPatient.fullName || "");
    }
  }, [form.patient, patient, patients]);

  useEffect(() => {
    if (patient) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!patientPickerRef.current?.contains(event.target)) {
        setIsPatientListOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [patient]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((entry) => {
      const name = entry.fullName?.toLowerCase() || "";
      const phone = entry.phone?.toLowerCase() || "";

      return name.includes(query) || phone.includes(query);
    });
  }, [patientSearch, patients]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handlePatientSearchChange = (event) => {
    const value = event.target.value;

    setPatientSearch(value);
    setIsPatientListOpen(true);
    setForm((current) => ({
      ...current,
      patient: ""
    }));
  };

  const handlePatientSelect = (selectedPatient) => {
    setForm((current) => ({
      ...current,
      patient: selectedPatient._id
    }));
    setPatientSearch(selectedPatient.fullName || "");
    setIsPatientListOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!patient && !form.patient) {
      setError("Select a patient from the search results before saving.");
      return;
    }

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
            <div ref={patientPickerRef} className="relative">
              <label className="mb-2 block text-foreground">Patient</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                  onFocus={() => setIsPatientListOpen(true)}
                  placeholder="Search by patient name or phone"
                  className="w-full rounded-lg border border-border bg-input-background py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoadingOptions}
                />
                <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {isPatientListOpen ? (
                <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
                  {isLoadingOptions ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      Loading patients...
                    </div>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((entry) => (
                      <button
                        key={entry._id}
                        type="button"
                        onClick={() => handlePatientSelect(entry)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                      >
                        <div>
                          <p className="text-sm text-foreground">{entry.fullName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {entry.phone || "No phone"}
                          </p>
                        </div>
                        {form.patient === entry._id ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      No patients match that search.
                    </div>
                  )}
                </div>
              ) : null}

              <input
                type="hidden"
                name="patient"
                value={form.patient}
              />
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
