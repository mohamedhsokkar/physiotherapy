const PAGE_ACCESS = {
  receptionist: ["patients", "patientProfile", "visits"],
  doctor: ["patients", "patientProfile", "visits", "reports"],
  admin: ["dashboard", "patients", "patientProfile", "visits", "finance", "reports", "admin"]
};

const DEFAULT_PAGE_BY_ROLE = {
  receptionist: "patients",
  doctor: "patients",
  admin: "dashboard"
};

const PAGE_PATHS = {
  dashboard: "/dashboard",
  patients: "/patients",
  visits: "/visits",
  finance: "/finance",
  reports: "/reports",
  admin: "/admin"
};

function getAllowedPages(role) {
  return PAGE_ACCESS[role] || [];
}

function canAccessPage(role, page) {
  return getAllowedPages(role).includes(page);
}

function getDefaultPage(role) {
  return DEFAULT_PAGE_BY_ROLE[role] || "patients";
}

function getPagePath(page) {
  return PAGE_PATHS[page] || PAGE_PATHS.patients;
}

function getDefaultPath(role) {
  return getPagePath(getDefaultPage(role));
}

export { canAccessPage, getAllowedPages, getDefaultPage, getDefaultPath, getPagePath };
