import { LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings, Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getAllowedPages } from "../lib/permissions";
function Sidebar({
  currentPage,
  onNavigate,
  user
}) {
  const {
    language,
    setLanguage,
    t,
    isRTL
  } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = [{
    id: "dashboard",
    label: t("nav.dashboard"),
    icon: LayoutDashboard
  }, {
    id: "patients",
    label: t("nav.patients"),
    icon: Users
  }, {
    id: "visits",
    label: t("nav.visits"),
    icon: Calendar
  }, {
    id: "finance",
    label: t("nav.finance"),
    icon: DollarSign
  }, {
    id: "reports",
    label: t("nav.reports"),
    icon: FileText
  }, {
    id: "admin",
    label: t("nav.admin"),
    icon: Settings
  }].filter(item => getAllowedPages(user?.role).includes(item.id));
  const handleNavigate = id => {
    onNavigate(id);
    setIsMobileOpen(false);
  };
  return <><button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-border shadow-lg">{isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>{isMobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />}<div className={`w-64 bg-white ${isRTL ? "border-l" : "border-r"} border-border h-screen fixed ${isRTL ? "right-0" : "left-0"} top-0 flex flex-col z-40 transition-transform lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}`}><div className="p-6 border-b border-border"><div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}><Activity className="w-8 h-8 text-primary" /><div className={isRTL ? "text-right" : ""}><h2 className="text-primary">{t("app.title")}</h2><p className="text-xs text-muted-foreground">{t("app.subtitle")}</p></div></div></div><nav className="flex-1 p-4">{navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return <button onClick={() => handleNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"} ${isRTL ? "flex-row-reverse" : ""}`} key={item.id}><Icon className="w-5 h-5" /><span>{item.label}</span></button>;
        })}</nav><div className="p-4 border-t border-border"><button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"><span className={language === "en" ? "" : "opacity-50"}>Eng</span><span className="text-border">/</span><span className={language === "ar" ? "" : "opacity-50"}>عربي</span></button></div></div></>;
}
export { Sidebar };
