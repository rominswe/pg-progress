import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/api";
import { socket } from "@/services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // 🔐 single source of truth on refresh
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {

      try {
        const res = await authService.me();


        if (mounted && res?.success && res.data) {

          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          if (!socket.connected) {
            socket.connect();
          }
        } else {

          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("[AuthContext] checkAuth exception:", err.message, err.response?.status);
        setUser(null);
        localStorage.removeItem("user");
      } finally {

        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);


  const login = async (role, credentials) => {
    const res = await authService.login(role, credentials);

    if (res?.data?.mustChangePassword) {
      return res.data;
    }

    if (res?.success && res.data) {
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    }

    throw new Error(res?.error || "Login failed");
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);