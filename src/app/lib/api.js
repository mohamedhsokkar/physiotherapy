var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const API_BASE_URL = import.meta.env.VITE_API_URL //|| "http://localhost:3007/api";
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    __publicField(this, "status");
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
      ...token ? { Authorization: `Bearer ${token}` } : {},
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
  getPatients(token, search = "") {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
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
  }
};
export {
  ApiError,
  api
};
