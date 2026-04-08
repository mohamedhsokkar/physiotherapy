import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Calendar, Plus } from "lucide-react";
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

function getVisitStatusStyles(status) {
  switch (status) {
    case "completed":
      return {
        backgroundColor: "#dcfce7",
        borderColor: "#16a34a",
        textColor: "#166534"
      };
    case "cancelled":
      return {
        backgroundColor: "#fee2e2",
        borderColor: "#dc2626",
        textColor: "#991b1b"
      };
    default:
      return {
        backgroundColor: "#dbeafe",
        borderColor: "#2563eb",
        textColor: "#1d4ed8"
      };
  }
}

function VisitsPage({
  token,
  user,
  onOpenModal,
  refreshKey
}) {
  const [visits, setVisits] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const canCreateVisit = user?.role !== "doctor";

  useEffect(() => {
    let isCancelled = false;

    const loadVisits = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.getVisits(token, {
          limit: 500,
          ...(user?.role === "doctor" ? { doctor: user.id } : {}),
          ...filters
        });

        if (!isCancelled) {
          setVisits(response.data.visits);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load visits"
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadVisits();

    return () => {
      isCancelled = true;
    };
  }, [filters, refreshKey, token, user?.id, user?.role]);

  const calendarEvents = useMemo(
    () =>
      visits.map((visit) => ({
        id: visit._id,
        title: visit.patient?.fullName || "Unknown patient",
        start: visit.visitDate,
        end: visit.visitDate,
        extendedProps: {
          doctor: visit.doctor?.name || "Unassigned",
          visitType: formatVisitType(visit.visitType),
          status: visit.status
        },
        ...getVisitStatusStyles(visit.status)
      })),
    [visits]
  );

  const handleDayClick = (info) => {
    if (!canCreateVisit) {
      return;
    }

    onOpenModal("addVisit", {
      initialDate: info.date
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-foreground">Visits</h2>
          <p className="text-sm text-muted-foreground">
            Manage appointments in calendar day, week, and month views.
          </p>
        </div>
        {canCreateVisit ? (
          <button
            onClick={() => onOpenModal("addVisit")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            <span>Add Visit</span>
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-foreground">Status</label>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value
              }))
            }
            className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-foreground">
            Payment status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                paymentStatus: event.target.value
              }))
            }
            className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All payments</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {canCreateVisit
              ? "Click any day in the calendar to open a new visit form for that date."
              : "Doctors can browse the visit calendar in day, week, and month views."}
          </p>
        </div>

        <div className="visit-calendar overflow-hidden rounded-lg border border-border">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading visits...
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              height="auto"
              editable={false}
              selectable={canCreateVisit}
              dayMaxEvents={3}
              events={calendarEvents}
              dateClick={handleDayClick}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short"
              }}
              eventContent={(eventInfo) => (
                <div className="px-1 py-0.5">
                  <div className="truncate text-xs font-medium">
                    {eventInfo.timeText ? `${eventInfo.timeText} ` : ""}
                    {eventInfo.event.title}
                  </div>
                  <div className="truncate text-[11px] opacity-80">
                    {eventInfo.event.extendedProps.visitType}
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full">
          <thead className="border-b border-border bg-accent">
            <tr>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Patient
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Doctor
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Visit
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Status
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Payment
              </th>
              <th className="px-4 py-4 text-right text-foreground md:px-6">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  Loading visits...
                </td>
              </tr>
            ) : visits.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No visits found.
                </td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr
                  key={visit._id}
                  className="border-b border-border transition-colors hover:bg-accent/40"
                >
                  <td className="px-4 py-4 md:px-6">
                    <p className="text-sm text-foreground">
                      {visit.patient?.fullName || "Unknown patient"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {visit.patient?.phone || "No phone"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground md:px-6">
                    {visit.doctor?.name || "Unassigned"}
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <p className="text-sm text-foreground">
                      {new Date(visit.visitDate).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {formatVisitType(visit.visitType)}
                    </p>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs capitalize text-muted-foreground">
                      {visit.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs capitalize text-muted-foreground">
                      {visit.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right md:px-6">
                    <p className="text-sm text-foreground">
                      {formatCurrency(visit.totalAmount)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paid {formatCurrency(visit.amountPaid)}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { VisitsPage };
