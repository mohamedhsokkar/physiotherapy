import { LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings, Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { getAllowedPages } from "../lib/permissions";

function Sidebar({ user }) {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      to: "/dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
      end: true
    },
    {
      id: "patients",
      to: "/patients",
      label: t("nav.patients"),
      icon: Users,
      end: false
    },
    {
      id: "visits",
      to: "/visits",
      label: t("nav.visits"),
      icon: Calendar,
      end: false
    },
    {
      id: "finance",
      to: "/finance",
      label: t("nav.finance"),
      icon: DollarSign,
      end: true
    },
    {
      id: "reports",
      to: "/reports",
      label: t("nav.reports"),
      icon: FileText,
      end: true
    },
    {
      id: "admin",
      to: "/admin",
      label: t("nav.admin"),
      icon: Settings,
      end: true
    }
  ].filter((item) => getAllowedPages(user?.role).includes(item.id));

  const handleNavigate = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`fixed top-4 z-50 rounded-lg border border-border bg-white p-2 shadow-lg lg:hidden ${
          isRTL ? "right-4" : "left-4"
        }`}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <div
        className={`fixed top-0 z-40 flex h-screen w-64 flex-col border-border bg-white transition-transform lg:translate-x-0 ${
          isRTL ? "right-0 border-l" : "left-0 border-r"
        } ${isMobileOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}`}
      >
        <div className="border-b border-border p-6">
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Activity className="h-8 w-8 text-primary" />
            <div className={isRTL ? "text-right" : ""}>
              <h2 className="text-primary">{t("app.title")}</h2>
              <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                onClick={handleNavigate}
                className={({ isActive }) =>
                  `mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  } ${isRTL ? "flex-row-reverse" : ""}`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className={language === "en" ? "" : "opacity-50"}>Eng</span>
            <span className="text-border">/</span>
            <span className={language === "ar" ? "" : "opacity-50"}>Ø¹Ø±Ø¨ÙŠ</span>
          </button>
        </div>
      </div>
    </>
  );
}

export { Sidebar };
