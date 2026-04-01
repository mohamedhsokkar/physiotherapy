import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
const TOKEN_STORAGE_KEY = "clinic_auth_token";
const AuthContext = createContext(void 0);
function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }
    setToken(savedToken);
    api.me(savedToken).then(response => {
      setUser(response.data);
    }).catch(() => {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);
  const login = async (email, password) => {
    const response = await api.login(email, password);
    const nextToken = response.data.token;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(response.data.user);
  };
  const logout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    token,
    isLoading,
    login,
    logout
  }}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export { AuthProvider, useAuth };
