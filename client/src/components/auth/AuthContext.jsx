import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user on mount
  useEffect(() => {
    authService
      .me()
      .then((res) => {
        if (res?.success && res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login function
  const login = async (role, credentials) => {
    try {
      const res = await authService.login(role, credentials);
      
      // Case 1: Force Password Change
      if (res.data?.mustChangePassword) {
        return res.data; 
      }
      
      // Case 2: Normal Successful Login
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      
      // Case 3: Backend returned success: false or missing data
      throw new Error(res.error || "Login failed");
    } catch (err) { // <--- Added the closing brace for 'try' here
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);