const RAW_API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:3007";

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "").endsWith("/api")
  ? RAW_API_BASE_URL.replace(/\/+$/, "")
  : `${RAW_API_BASE_URL.replace(/\/+$/, "")}/api`;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.message || "Request failed", response.status);
  }

  return payload;
}

const api = {
  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  me(token) {
    return request("/auth/me", {
      token
    });
  },

  getPatients(token, search = "", filters = {}) {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        params.set(key, `${value}`.trim());
      }
    });

    const query = params.toString();

    return request(`/patients${query ? `?${query}` : ""}`, {
      token
    });
  },

  getPatientById(token, patientId) {
    return request(`/patients/${patientId}`, {
      token
    });
  },

  createPatient(token, input) {
    return request("/patients", {
      method: "POST",
      token,
      body: JSON.stringify(input)
    });
  },

  getDashboardOverview(token) {
    return request("/dashboard/overview", {
      token
    });
  },

  getDashboardFinanceSummary(token) {
    return request("/dashboard/finance-summary", {
      token
    });
  },

  getDashboardVisitSummary(token) {
    return request("/dashboard/visit-summary", {
      token
    });
  },

  getDashboardRecentActivity(token) {
    return request("/dashboard/recent-activity", {
      token
    });
  },

  getUsers(token, filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        params.set(key, `${value}`.trim());
      }
    });

    const query = params.toString();

    return request(`/auth/users${query ? `?${query}` : ""}`, {
      token
    });
  },

  createUser(token, input) {
    return request("/auth/register", {
      method: "POST",
      token,
      body: JSON.stringify(input)
    });
  },

  getVisits(token, filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        params.set(key, `${value}`.trim());
      }
    });

    const query = params.toString();

    return request(`/visits${query ? `?${query}` : ""}`, {
      token
    });
  },

  createVisit(token, input) {
    return request("/visits", {
      method: "POST",
      token,
      body: JSON.stringify(input)
    });
  },

  getExpenses(token, filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        params.set(key, `${value}`.trim());
      }
    });

    const query = params.toString();

    return request(`/expenses${query ? `?${query}` : ""}`, {
      token
    });
  },

  createExpense(token, input) {
    return request("/expenses", {
      method: "POST",
      token,
      body: JSON.stringify(input)
    });
  }
};

export { ApiError, api };
