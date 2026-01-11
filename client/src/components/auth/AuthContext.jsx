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
      
      console.log("API RESPONSE:", res); // 👈 Check this in Console!

      // Ensure we are setting the correct object
      // If res.data contains { user: {...}, token: ... }, we might need res.data.user
      // Check your API response structure carefully.
      
      if (res.success && res.data) {
        // ⚠️ COMMON BUG: Does res.data HAVE the role_id? 
        // Or is it inside res.data.user?
        const userData = res.data.user || res.data; 
        
        setUser(userData); 
        return res.data;
      }
      
      throw new Error(res.error || "Login failed");
    } catch (err) {
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