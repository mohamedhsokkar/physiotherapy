import { useMemo, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext
} from "react-router";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { PatientsPage } from "./components/PatientsPage";
import { PatientProfilePage } from "./components/PatientProfilePage";
import { VisitsPage } from "./components/VisitsPage";
import { VisitDetailsPage } from "./components/VisitDetailsPage";
import { FinancePage } from "./components/FinancePage";
import { AdminPage } from "./components/AdminPage";
import { ReportsPage } from "./components/ReportsPage";
import { AddVisitModal } from "./components/AddVisitModal";
import { AddPatientModal } from "./components/AddPatientModal";
import { AddNoteModal } from "./components/AddNoteModal";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { LoginPage } from "./components/LoginPage";
import { canAccessPage, getDefaultPath, getPagePath } from "./lib/permissions";

function getPageTitle(pathname) {
  if (pathname.startsWith("/patients/")) {
    return "Patient Profile";
  }

  if (pathname.startsWith("/patients")) {
    return "Patients";
  }

  if (pathname.startsWith("/visits/")) {
    return "Visit Details";
  }

  if (pathname.startsWith("/visits")) {
    return "Visits";
  }

  if (pathname.startsWith("/finance")) {
    return "Finance";
  }

  if (pathname.startsWith("/reports")) {
    return "Reports";
  }

  if (pathname.startsWith("/admin")) {
    return "Admin";
  }

  return "Dashboard";
}

function resolvePagePath(page, data) {
  if (page === "patientProfile") {
    const patientId = data?.patientId || data?.patient?._id;
    return patientId ? `/patients/${patientId}` : getPagePath("patients");
  }

  return getPagePath(page);
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [currentModal, setCurrentModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [visitsRefreshKey, setVisitsRefreshKey] = useState(0);
  const [expensesRefreshKey, setExpensesRefreshKey] = useState(0);

  const shellContext = useMemo(
    () => ({
      token,
      user,
      visitsRefreshKey,
      expensesRefreshKey,
      openModal(modal, data) {
        setCurrentModal(modal);
        setModalData(data || null);
      },
      navigateTo(page, data) {
        navigate(resolvePagePath(page, data));
      }
    }),
    [expensesRefreshKey, navigate, token, user, visitsRefreshKey]
  );

  const closeModal = () => {
    setCurrentModal(null);
    setModalData(null);
  };

  const handleVisitCreated = () => {
    setVisitsRefreshKey((current) => current + 1);
  };

  const handleExpenseCreated = () => {
    setExpensesRefreshKey((current) => current + 1);
  };

  const handlePatientCreated = (patient) => {
    closeModal();
    navigate(`/patients/${patient._id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <TopBar pageTitle={getPageTitle(location.pathname)} />
      <main className="mt-16 p-4 md:p-6 lg:ml-64">
        <Outlet context={shellContext} />
      </main>

      {currentModal === "addVisit" ? (
        <AddVisitModal
          token={token}
          onClose={closeModal}
          patient={modalData?.patient}
          initialDate={modalData?.initialDate}
          onCreated={handleVisitCreated}
        />
      ) : null}
      {currentModal === "addPatient" ? (
        <AddPatientModal token={token} onClose={closeModal} onCreated={handlePatientCreated} />
      ) : null}
      {currentModal === "addNote" ? (
        <AddNoteModal onClose={closeModal} patient={modalData?.patient} />
      ) : null}
      {currentModal === "addExpense" ? (
        <AddExpenseModal token={token} onClose={closeModal} onCreated={handleExpenseCreated} />
      ) : null}
    </div>
  );
}

function useAppShell() {
  return useOutletContext();
}

function RequirePageAccess({ page, children }) {
  const { user } = useAuth();

  if (!canAccessPage(user?.role, page)) {
    return <Navigate to={getDefaultPath(user?.role)} replace />;
  }

  return children;
}

function DashboardRoute() {
  const { token, navigateTo } = useAppShell();

  return <Dashboard token={token} onNavigate={navigateTo} />;
}

function PatientsRoute() {
  const { token, openModal, navigateTo } = useAppShell();

  return (
    <PatientsPage
      token={token}
      onOpenModal={openModal}
      onOpenPatient={(patient) => navigateTo("patientProfile", { patient })}
    />
  );
}

function PatientProfileRoute() {
  const { token, openModal, visitsRefreshKey } = useAppShell();

  return (
    <PatientProfilePage
      token={token}
      onOpenModal={openModal}
      refreshKey={visitsRefreshKey}
    />
  );
}

function VisitsRoute() {
  const { token, user, openModal, visitsRefreshKey } = useAppShell();
  const navigate = useNavigate();

  return (
    <VisitsPage
      token={token}
      user={user}
      onOpenModal={openModal}
      refreshKey={visitsRefreshKey}
      onOpenVisit={(visit) => navigate(`/visits/${visit._id}`)}
    />
  );
}

function VisitDetailsRoute() {
  const { token } = useAppShell();

  return <VisitDetailsPage token={token} />;
}

function FinanceRoute() {
  const { token, user, openModal, expensesRefreshKey } = useAppShell();

  return (
    <FinancePage
      token={token}
      user={user}
      onOpenModal={openModal}
      refreshKey={expensesRefreshKey}
    />
  );
}

function AdminRoute() {
  const { token } = useAppShell();

  return <AdminPage token={token} />;
}

function AppRoutes() {
  const { isLoading, token, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!token || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const defaultPath = getDefaultPath(user.role);

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={defaultPath} replace />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to={defaultPath} replace />} />
        <Route
          path="/dashboard"
          element={
            <RequirePageAccess page="dashboard">
              <DashboardRoute />
            </RequirePageAccess>
          }
        />
        <Route
          path="/patients"
          element={
            <RequirePageAccess page="patients">
              <PatientsRoute />
            </RequirePageAccess>
          }
        />
        <Route
          path="/patients/:patientId"
          element={
            <RequirePageAccess page="patientProfile">
              <PatientProfileRoute />
            </RequirePageAccess>
          }
        />
        <Route
          path="/visits"
          element={
            <RequirePageAccess page="visits">
              <VisitsRoute />
            </RequirePageAccess>
          }
        />
        <Route
          path="/visits/:visitId"
          element={
            <RequirePageAccess page="visits">
              <VisitDetailsRoute />
            </RequirePageAccess>
          }
        />
        <Route
          path="/finance"
          element={
            <RequirePageAccess page="finance">
              <FinanceRoute />
            </RequirePageAccess>
          }
        />
        <Route
          path="/reports"
          element={
            <RequirePageAccess page="reports">
              <ReportsPage />
            </RequirePageAccess>
          }
        />
        <Route
          path="/admin"
          element={
            <RequirePageAccess page="admin">
              <AdminRoute />
            </RequirePageAccess>
          }
        />
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </LanguageProvider>
  );
}

export { App as default };
