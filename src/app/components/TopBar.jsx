import { Bell, LogOut, Search, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
function TopBar({
  pageTitle
}) {
  const {
    isRTL
  } = useLanguage();
  const {
    user,
    logout
  } = useAuth();
  return <div className={`fixed top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6 ${isRTL ? "left-0 right-0 pr-20 lg:right-64 lg:pr-6" : "left-0 right-0 pl-20 lg:left-64 lg:pl-6"}`}><h1 className="truncate text-foreground">{pageTitle}</h1><div className={`flex items-center gap-2 md:gap-4 ${isRTL ? "flex-row-reverse" : ""}`}><button className="rounded-lg p-2 transition-colors hover:bg-accent"><Search className="h-5 w-5 text-muted-foreground" /></button><button className="relative rounded-lg p-2 transition-colors hover:bg-accent"><Bell className="h-5 w-5 text-muted-foreground" /><span className={`absolute top-1 h-2 w-2 rounded-full bg-destructive ${isRTL ? "left-1" : "right-1"}`} /></button><button onClick={logout} className="rounded-lg p-2 transition-colors hover:bg-accent" title="Logout"><LogOut className="h-5 w-5 text-muted-foreground" /></button><div className={`flex items-center gap-2 border-border md:gap-3 ${isRTL ? "border-r pr-4" : "border-l pl-4"}`}><div className={isRTL ? "text-left" : "text-right"}><p className="hidden text-sm text-foreground md:block">{user?.name || "Unknown user"}</p><p className="hidden text-xs capitalize text-muted-foreground md:block">{user?.role || "guest"}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"><User className="h-5 w-5 text-primary-foreground" /></div></div></div></div>;
}
export { TopBar };
