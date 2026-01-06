import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user on mount
  useEffect(() => {
    authService
      .me()
      .then((res) => {
        if (res?.user) setUser(res.user);
        else setUser(null);
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
      const data = await authService.login(role, credentials);
      if (!data.user) throw new Error("Login failed: no user returned");
      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Login error:", err);
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