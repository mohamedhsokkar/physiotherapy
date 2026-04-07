import { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { PatientsPage } from "./components/PatientsPage";
import { PatientProfile } from "./components/PatientProfile";
import { VisitsPage } from "./components/VisitsPage";
import { FinancePage } from "./components/FinancePage";
import { AdminPage } from "./components/AdminPage";
import { ReportsPage } from "./components/ReportsPage";
import { AddVisitModal } from "./components/AddVisitModal";
import { AddPatientModal } from "./components/AddPatientModal";
import { AddNoteModal } from "./components/AddNoteModal";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { AddUserModal } from "./components/AddUserModal";
import { LoginPage } from "./components/LoginPage";
function AppContent() {
  const {
    isLoading,
    token,
    user
  } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [currentModal, setCurrentModal] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [visitsRefreshKey, setVisitsRefreshKey] = useState(0);
  const [expensesRefreshKey, setExpensesRefreshKey] = useState(0);
  const handleNavigate = (page, data) => {
    setCurrentPage(page);
    setPageData(data || null);
  };
  const handleOpenModal = (modal, data) => {
    setCurrentModal(modal);
    setModalData(data || null);
  };
  const handleCloseModal = () => {
    setCurrentModal(null);
    setModalData(null);
  };
  const handlePatientCreated = patient => {
    setCurrentPage("patientProfile");
    setPageData({
      patientId: patient._id,
      patient
    });
  };
  const handleVisitCreated = () => {
    setVisitsRefreshKey(current => current + 1);
  };
  const handleExpenseCreated = () => {
    setExpensesRefreshKey(current => current + 1);
  };
  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard";
      case "patients":
        return "Patients";
      case "patientProfile":
        return "Patient Profile";
      case "visits":
        return "Visits";
      case "finance":
        return "Finance";
      case "reports":
        return "Reports";
      case "admin":
        return "Admin";
      default:
        return "Dashboard";
    }
  };
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading session...</div>;
  }
  if (!token || !user) {
    return <LoginPage />;
  }
  const patientProfileData = pageData;
  return <div className="min-h-screen bg-background"><Sidebar currentPage={currentPage} onNavigate={handleNavigate} /><TopBar pageTitle={getPageTitle()} /><main className="mt-16 p-4 md:p-6 lg:ml-64">{currentPage === "dashboard" && <Dashboard token={token} onNavigate={handleNavigate} />}{currentPage === "patients" && <PatientsPage token={token} onNavigate={handleNavigate} onOpenModal={handleOpenModal} />}{currentPage === "visits" && <VisitsPage token={token} user={user} onOpenModal={handleOpenModal} refreshKey={visitsRefreshKey} />}{currentPage === "patientProfile" && patientProfileData?.patient ? <PatientProfile token={token} patient={patientProfileData.patient} onBack={() => handleNavigate("patients")} onOpenModal={handleOpenModal} refreshKey={visitsRefreshKey} /> : null}{currentPage === "finance" && <FinancePage token={token} user={user} onOpenModal={handleOpenModal} refreshKey={expensesRefreshKey} />}{currentPage === "reports" && <ReportsPage />}{currentPage === "admin" && <AdminPage onOpenModal={handleOpenModal} />}</main>{currentModal === "addVisit" ? <AddVisitModal token={token} onClose={handleCloseModal} patient={modalData?.patient} onCreated={handleVisitCreated} /> : null}{currentModal === "addPatient" ? <AddPatientModal token={token} onClose={handleCloseModal} onCreated={handlePatientCreated} /> : null}{currentModal === "addNote" ? <AddNoteModal onClose={handleCloseModal} patient={modalData?.patient} /> : null}{currentModal === "addExpense" ? <AddExpenseModal token={token} onClose={handleCloseModal} onCreated={handleExpenseCreated} /> : null}{currentModal === "addUser" ? <AddUserModal onClose={handleCloseModal} /> : null}</div>;
}
function App() {
  return <LanguageProvider><AuthProvider><AppContent /></AuthProvider></LanguageProvider>;
}
export { App as default };
