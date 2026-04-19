import { useEffect, useState } from "react";
import { Activity, Calendar, DollarSign, Receipt, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { useLanguage } from "../context/LanguageContext";
import { api, ApiError } from "../lib/api";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0
});
const dashboardChartConfig = {
  visits: {
    label: "Visits",
    color: "hsl(194 90% 42%)"
  },
  newPatients: {
    label: "New Patients",
    color: "hsl(152 62% 38%)"
  },
  income: {
    label: "Income",
    color: "hsl(142 76% 36%)"
  },
  expenses: {
    label: "Expenses",
    color: "hsl(12 76% 56%)"
  },
  net: {
    label: "Net",
    color: "hsl(226 70% 55%)"
  },
  scheduled: {
    label: "Scheduled",
    color: "hsl(43 96% 56%)"
  },
  completed: {
    label: "Completed",
    color: "hsl(152 62% 38%)"
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(0 72% 51%)"
  },
  unpaid: {
    label: "Unpaid",
    color: "hsl(0 72% 51%)"
  },
  partial: {
    label: "Partial",
    color: "hsl(43 96% 56%)"
  },
  paid: {
    label: "Paid",
    color: "hsl(152 62% 38%)"
  }
};
function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}
function formatDateTime(value) {
  return new Date(value).toLocaleString();
}
function getErrorMessage(error) {
  if (error instanceof ApiError && error.status === 403) {
    return "Some dashboard sections are hidden for your role.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to load dashboard data.";
}
function Dashboard({
  token,
  onNavigate
}) {
  const {
    isRTL
  } = useLanguage();
  const [data, setData] = useState({
    overview: null,
    finance: null,
    visits: null,
    activity: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isCancelled = false;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");
      const results = await Promise.allSettled([api.getDashboardOverview(token), api.getDashboardFinanceSummary(token), api.getDashboardVisitSummary(token), api.getDashboardRecentActivity(token)]);
      if (isCancelled) {
        return;
      }
      const [overviewResult, financeResult, visitResult, activityResult] = results;
      const nextData = {
        overview: overviewResult.status === "fulfilled" ? overviewResult.value.data : null,
        finance: financeResult.status === "fulfilled" ? financeResult.value.data : null,
        visits: visitResult.status === "fulfilled" ? visitResult.value.data : null,
        activity: activityResult.status === "fulfilled" ? activityResult.value.data : null
      };
      setData(nextData);
      const rejected = results.find(result => result.status === "rejected");
      if (rejected) {
        setError(getErrorMessage(rejected.reason));
      }
      setIsLoading(false);
    };
    loadDashboard().catch(loadError => {
      if (!isCancelled) {
        setError(getErrorMessage(loadError));
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [token]);
  const cards = data.overview?.cards;
  const visitStatusData = data.visits ? [{
    name: "scheduled",
    value: data.visits.byStatus.scheduled,
    fill: "var(--color-scheduled)"
  }, {
    name: "completed",
    value: data.visits.byStatus.completed,
    fill: "var(--color-completed)"
  }, {
    name: "cancelled",
    value: data.visits.byStatus.cancelled,
    fill: "var(--color-cancelled)"
  }] : [];
  const paymentStatusData = data.visits ? [{
    name: "unpaid",
    value: data.visits.byPaymentStatus.unpaid,
    fill: "var(--color-unpaid)"
  }, {
    name: "partial",
    value: data.visits.byPaymentStatus.partial,
    fill: "var(--color-partial)"
  }, {
    name: "paid",
    value: data.visits.byPaymentStatus.paid,
    fill: "var(--color-paid)"
  }] : [];
  return <div className="space-y-6">{error ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div> : null}<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-lg border border-border bg-white p-5"><div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><p className="text-sm text-muted-foreground">Active Patients</p><Users className="h-5 w-5 text-primary" /></div><p className="mt-3 text-3xl text-foreground">{isLoading ? "..." : cards?.activePatients ?? "--"}</p><p className="mt-1 text-xs text-muted-foreground">Total patients: {cards?.totalPatients ?? "--"}</p></div><div className="rounded-lg border border-border bg-white p-5"><div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><p className="text-sm text-muted-foreground">Visits Today</p><Calendar className="h-5 w-5 text-primary" /></div><p className="mt-3 text-3xl text-foreground">{isLoading ? "..." : cards?.todayVisits ?? data.visits?.totals.todayVisits ?? "--"}</p><p className="mt-1 text-xs text-muted-foreground">This month: {cards?.monthlyVisits ?? data.visits?.totals.monthlyVisits ?? "--"}</p></div><div className="rounded-lg border border-border bg-white p-5"><div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><p className="text-sm text-muted-foreground">Income Today</p><DollarSign className="h-5 w-5 text-primary" /></div><p className="mt-3 text-3xl text-foreground">{isLoading ? "..." : formatCurrency(data.finance?.today.income ?? 0)}</p><p className="mt-1 text-xs text-muted-foreground">Month: {formatCurrency(data.finance?.month.income ?? cards?.monthlyIncome ?? 0)}</p></div><div className="rounded-lg border border-border bg-white p-5"><div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><p className="text-sm text-muted-foreground">Net This Month</p><TrendingUp className="h-5 w-5 text-primary" /></div><p className="mt-3 text-3xl text-foreground">{isLoading ? "..." : formatCurrency(data.finance?.month.net ?? cards?.monthlyNet ?? 0)}</p><p className="mt-1 text-xs text-muted-foreground">Expenses: {formatCurrency(data.finance?.month.expenses ?? cards?.monthlyExpenses ?? 0)}</p></div></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]"><div className="rounded-lg border border-border bg-white p-5"><div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><h3 className="text-foreground">Weekly Trends</h3><p className="text-sm text-muted-foreground">Visits, new patients, income, and expenses over the last 7 days.</p></div><Activity className="h-5 w-5 text-primary" /></div>{data.overview?.trends?.length ? <ChartContainer className="h-[320px] w-full" config={dashboardChartConfig}><LineChart data={data.overview.trends}><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={40} /><ChartTooltip content={<ChartTooltipContent labelKey="shortDate" />} /><Line type="monotone" dataKey="visits" stroke="var(--color-visits)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="newPatients" stroke="var(--color-newPatients)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} /><ChartLegend content={<ChartLegendContent />} /></LineChart></ChartContainer> : data.visits?.daily?.length ? <ChartContainer className="h-[320px] w-full" config={dashboardChartConfig}><BarChart data={data.visits.daily}><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={40} /><ChartTooltip content={<ChartTooltipContent labelKey="shortDate" />} /><Bar dataKey="visits" fill="var(--color-visits)" radius={8} /></BarChart></ChartContainer> : <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">No trend data available yet.</div>}</div><div className="rounded-lg border border-border bg-white p-5"><div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><h3 className="text-foreground">Today's Schedule</h3><p className="text-sm text-muted-foreground">Next visits pulled from today's records.</p></div><Calendar className="h-5 w-5 text-primary" /></div>{data.overview?.todaySchedule?.length ? <div className="space-y-3">{data.overview.todaySchedule.map(visit => <div className="rounded-lg border border-border bg-accent/40 px-4 py-3" key={visit._id}><div className={`flex items-start justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><p className="text-sm text-foreground">{visit.patient?.fullName || "Unknown patient"}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(visit.visitDate)}</p></div><span className="rounded-full bg-white px-2 py-1 text-xs capitalize text-muted-foreground">{visit.status}</span></div><p className="mt-2 text-xs text-muted-foreground">{visit.visitType.replace("_", " ")} with Dr. {visit.doctor?.name || "Unassigned"}</p></div>)}</div> : <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">No visits scheduled for today.</div>}</div></div><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><div className="rounded-lg border border-border bg-white p-5"><div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><h3 className="text-foreground">Visit Status</h3><p className="text-sm text-muted-foreground">Scheduled vs completed vs cancelled.</p></div><Receipt className="h-5 w-5 text-primary" /></div>{visitStatusData.length ? <ChartContainer className="h-[280px] w-full" config={dashboardChartConfig}><PieChart><ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} /><Pie data={visitStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} /><ChartLegend content={<ChartLegendContent nameKey="name" />} /></PieChart></ChartContainer> : <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">Visit summary is unavailable for this account.</div>}</div><div className="rounded-lg border border-border bg-white p-5"><div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><h3 className="text-foreground">Payment Status</h3><p className="text-sm text-muted-foreground">How visits are being paid.</p></div><DollarSign className="h-5 w-5 text-primary" /></div>{paymentStatusData.length ? <ChartContainer className="h-[280px] w-full" config={dashboardChartConfig}><BarChart data={paymentStatusData}><CartesianGrid vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={40} /><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Bar dataKey="value" radius={8}>{paymentStatusData.map(entry => <Cell fill={entry.fill} key={entry.name} />)}</Bar></BarChart></ChartContainer> : <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">Payment summary is unavailable for this account.</div>}</div></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><div className="rounded-lg border border-border bg-white p-5"><div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><h3 className="text-foreground">Recent Activity</h3><p className="text-sm text-muted-foreground">Latest patients, visits, and expenses.</p></div><Activity className="h-5 w-5 text-primary" /></div>{data.activity ? <div className="space-y-3">{data.activity.recentVisits.slice(0, 3).map(visit => <div className="rounded-lg border border-border px-4 py-3" key={visit._id}><p className="text-sm text-foreground">{visit.patient?.fullName || "Unknown patient"}</p><p className="mt-1 text-xs text-muted-foreground">Visit {visit.status} on {formatDateTime(visit.visitDate)}</p></div>)}{data.activity.recentPatients.slice(0, 2).map(patient => <div className="rounded-lg border border-border px-4 py-3" key={patient._id}><p className="text-sm text-foreground">{patient.fullName}</p><p className="mt-1 text-xs text-muted-foreground">Added {formatDateTime(patient.createdAt)}</p></div>)}</div> : <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">Recent activity is unavailable for this account.</div>}</div><div className="rounded-lg border border-border bg-white p-5"><div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}><div className={isRTL ? "text-right" : ""}><h3 className="text-foreground">Quick Actions</h3><p className="text-sm text-muted-foreground">Jump into the most used workflows.</p></div><Users className="h-5 w-5 text-primary" /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><button onClick={() => onNavigate("patients")} className={`flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90 ${isRTL ? "flex-row-reverse" : ""}`}><Users className="h-5 w-5" /><span>Open Patients</span></button><button onClick={() => onNavigate("visits")} className={`flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-accent-foreground transition-colors hover:bg-accent/80 ${isRTL ? "flex-row-reverse" : ""}`}><Calendar className="h-5 w-5" /><span>Manage Visits</span></button></div></div></div></div>;
}
export { Dashboard };
