import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem("edutracker_token");
        const storedUser = authAPI.getStoredUser();
        
        console.log("Restoring session...", { storedToken: !!storedToken, storedUser: !!storedUser });
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          try {
            const freshUserData = await authAPI.getMe();
            console.log("Fresh user data from /me:", freshUserData);
            
            // Handle both cases: direct user object or nested user object
            const freshUser = freshUserData?.user || freshUserData;
            
            if (freshUser) {
              setUser(freshUser);
              console.log("User refreshed successfully");
            } else {
              console.warn("No user data in response, keeping stored user");
            }
          } catch (error) {
            console.error("Failed to refresh user:", error);
            // Token might be expired, clear it
            authAPI.logout();
            setToken(null);
            setUser(null);
          }
        } else {
          console.log("No stored session found");
        }
      } finally {
        setLoading(false);
      }
    };
    
    restoreSession();
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
    const user = freshUser?.user || freshUser;
    setUser(user);
    return user;
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
