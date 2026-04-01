import { useState } from "react";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
function LoginPage() {
  const {
    login
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background px-4 py-10"><div className="mx-auto flex min-h-[80vh] max-w-5xl overflow-hidden rounded-3xl border border-border bg-white shadow-sm"><div className="hidden w-1/2 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex"><div className="flex items-center gap-3"><Activity className="h-8 w-8" /><div><h1 className="text-2xl">PhysioClinic</h1><p className="text-sm text-primary-foreground/80">Connected workspace</p></div></div><div className="space-y-4"><h2 className="text-4xl leading-tight">Sign in to access the live clinic data.</h2><p className="max-w-md text-sm text-primary-foreground/80">The frontend is now wired to the backend auth and patient APIs. Use a valid server user account to continue.</p></div><p className="text-xs text-primary-foreground/70">API base URL: <span className="font-mono">{import.meta.env.VITE_API_URL || "http://localhost:3007/api"}</span></p></div><div className="flex flex-1 items-center justify-center p-6 md:p-10"><form onSubmit={handleSubmit} className="w-full max-w-md space-y-5"><div><h2 className="text-2xl text-foreground">Login</h2><p className="mt-1 text-sm text-muted-foreground">Enter the same credentials accepted by `POST /api/auth/login`.</p></div><div className="space-y-2"><label className="block text-sm text-foreground">Email</label><input type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="doctor@clinic.com" required /></div><div className="space-y-2"><label className="block text-sm text-foreground">Password</label><input type="password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter password" required /></div>{error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}<button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Signing in..." : "Sign in"}</button></form></div></div></div>;
}
export { LoginPage };
