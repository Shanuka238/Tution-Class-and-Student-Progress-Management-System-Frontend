// ============================================
// EduTracker — Auth Context
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("edutracker_token");
    const storedUser = authAPI.getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      authAPI.getMe()
        .then((freshUser) => setUser(freshUser))
        .catch(() => { authAPI.logout(); setUser(null); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authAPI.login(credentials);
    const token = localStorage.getItem("edutracker_token");
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const freshUser = await authAPI.getMe();
    setUser(freshUser);
    return freshUser;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token && !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export default AuthContext;
