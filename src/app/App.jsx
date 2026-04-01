import { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { PatientsPage } from "./components/PatientsPage";
import { PatientProfile } from "./components/PatientProfile";
import { FinancePage } from "./components/FinancePage";
import { AdminPage } from "./components/AdminPage";
import { ReportsPage } from "./components/ReportsPage";
import { AddVisitModal } from "./components/AddVisitModal";
import { AddPatientModal } from "./components/AddPatientModal";
import { AddNoteModal } from "./components/AddNoteModal";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { AddUserModal } from "./components/AddUserModal";
import { LoginPage } from "./components/LoginPage";
import { SectionPlaceholder } from "./components/SectionPlaceholder";
function AppContent() {
  const {
    isLoading,
    token,
    user
  } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [currentModal, setCurrentModal] = useState(null);
  const [pageData, setPageData] = useState(null);
  const handleNavigate = (page, data) => {
    setCurrentPage(page);
    setPageData(data || null);
  };
  const handleOpenModal = (modal, data) => {
    setCurrentModal(modal);
    setPageData(data || null);
  };
  const handleCloseModal = () => {
    setCurrentModal(null);
    setPageData(null);
  };
  const handlePatientCreated = patient => {
    setCurrentPage("patientProfile");
    setPageData({
      patientId: patient._id,
      patient
    });
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
  return <div className="min-h-screen bg-background"><Sidebar currentPage={currentPage} onNavigate={handleNavigate} /><TopBar pageTitle={getPageTitle()} /><main className="mt-16 p-4 md:p-6 lg:ml-64">{currentPage === "dashboard" && <Dashboard token={token} onNavigate={handleNavigate} />}{currentPage === "patients" && <PatientsPage token={token} onNavigate={handleNavigate} onOpenModal={handleOpenModal} />}{currentPage === "visits" && <SectionPlaceholder title="Visits module not connected yet" description="The UI shell is ready, but the server does not expose visit or appointment endpoints yet." />}{currentPage === "patientProfile" && patientProfileData?.patient ? <PatientProfile patient={patientProfileData.patient} onBack={() => handleNavigate("patients")} onOpenModal={handleOpenModal} /> : null}{currentPage === "finance" && <FinancePage onOpenModal={handleOpenModal} />}{currentPage === "reports" && <ReportsPage />}{currentPage === "admin" && <AdminPage onOpenModal={handleOpenModal} />}</main>{currentModal === "addVisit" ? <AddVisitModal onClose={handleCloseModal} patient={patientProfileData?.patient} /> : null}{currentModal === "addPatient" ? <AddPatientModal token={token} onClose={handleCloseModal} onCreated={handlePatientCreated} /> : null}{currentModal === "addNote" ? <AddNoteModal onClose={handleCloseModal} patient={patientProfileData?.patient} /> : null}{currentModal === "addExpense" ? <AddExpenseModal onClose={handleCloseModal} /> : null}{currentModal === "addUser" ? <AddUserModal onClose={handleCloseModal} /> : null}</div>;
}
function App() {
  return <LanguageProvider><AuthProvider><AppContent /></AuthProvider></LanguageProvider>;
}
export { App as default };
