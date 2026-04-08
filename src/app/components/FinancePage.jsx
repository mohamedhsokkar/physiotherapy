import { useEffect, useState } from "react";
import { DollarSign, Plus, Wallet } from "lucide-react";
import { api } from "../lib/api";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function formatCategory(value) {
  return value.replace(/_/g, " ");
}

function formatPaymentMethod(value) {
  return value.replace(/_/g, " ");
}

function FinancePage({
  token,
  user,
  onOpenModal,
  refreshKey
}) {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    paymentMethod: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadFinance = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [expensesResponse, summaryResponse] = await Promise.all([
          api.getExpenses(token, {
            limit: 50,
            ...filters
          }),
          api.getDashboardFinanceSummary(token)
        ]);

        if (!isCancelled) {
          setExpenses(expensesResponse.data.expenses);
          setSummary(summaryResponse.data);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load finance data"
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFinance();

    return () => {
      isCancelled = true;
    };
  }, [filters, refreshKey, token]);

  const canManageExpenses = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-foreground">Finance</h2>
          <p className="text-sm text-muted-foreground">
            Expense records from <code>/api/expenses</code> plus the dashboard
            finance summary.
          </p>
        </div>
        {canManageExpenses ? (
          <button
            onClick={() => onOpenModal("addExpense")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            <span>Add Expense</span>
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Income this month</p>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl text-foreground">
            {isLoading ? "..." : formatCurrency(summary?.month?.income)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Expenses this month</p>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl text-foreground">
            {isLoading ? "..." : formatCurrency(summary?.month?.expenses)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Net this month</p>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl text-foreground">
            {isLoading ? "..." : formatCurrency(summary?.month?.net)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-foreground">Category</label>
          <select
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value
              }))
            }
            className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All categories</option>
            <option value="rent">Rent</option>
            <option value="salary">Salary</option>
            <option value="utilities">Utilities</option>
            <option value="maintenance">Maintenance</option>
            <option value="supplies">Supplies</option>
            <option value="marketing">Marketing</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-foreground">
            Payment method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                paymentMethod: event.target.value
              }))
            }
            className="w-full rounded-lg border border-border bg-input-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full">
          <thead className="border-b border-border bg-accent">
            <tr>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Date
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Title
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Category
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Payment
              </th>
              <th className="px-4 py-4 text-left text-foreground md:px-6">
                Added by
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
                  Loading expenses...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="border-b border-border transition-colors hover:bg-accent/40"
                >
                  <td className="px-4 py-4 text-sm text-muted-foreground md:px-6">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <p className="text-sm text-foreground">{expense.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {expense.notes || "No notes"}
                    </p>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs capitalize text-muted-foreground">
                      {formatCategory(expense.category)}
                    </span>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs capitalize text-muted-foreground">
                      {formatPaymentMethod(expense.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground md:px-6">
                    {expense.createdBy?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-foreground md:px-6">
                    {formatCurrency(expense.amount)}
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

export { FinancePage };
