import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/api";
import { socket } from "@/services/socket";
import { initializeSessionMeta, refreshSessionActivity, getSessionMeta, clearSessionMeta } from "@/lib/sessionTimeout";

const AuthContext = createContext(null);

// Port-specific storage key to prevent session conflicts
const getStorageKey = () => {
  const port = window.location.port || '80';
  return `user_${port}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // 🔐 single source of truth on refresh
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // CRITICAL: Only check auth if we have a stored session for THIS port
      // This prevents loading wrong user data from cookies belonging to other ports
      const storedUser = sessionStorage.getItem(getStorageKey());

      if (!storedUser) {
        // No session for this port - show login page
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await authService.me();

        if (mounted && res?.success && res.data) {
          setUser(res.data);
          sessionStorage.setItem(getStorageKey(), JSON.stringify(res.data));
          if (!getSessionMeta()) {
            initializeSessionMeta();
          } else {
            refreshSessionActivity();
          }
          if (!socket.connected) {
            socket.connect();
          }
        } else {
          setUser(null);
          sessionStorage.removeItem(getStorageKey());
          clearSessionMeta();
        }
      } catch (err) {
        console.error("[AuthContext] checkAuth exception:", err.message, err.response?.status);
        setUser(null);
        sessionStorage.removeItem(getStorageKey());
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
      sessionStorage.setItem(getStorageKey(), JSON.stringify(res.data));
      initializeSessionMeta();
      return res.data;
    }

    throw new Error(res?.error || "Login failed");
  };

  const updateUser = (userData) => {
    const newUser = { ...user, ...userData };
    setUser(newUser);
    sessionStorage.setItem(getStorageKey(), JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      // Clear session data for ALL ports to prevent cross-portal session pollution
      // This ensures logging out from :5173 also clears :5174 and vice versa
      const ports = ['5173', '5174', '80'];
      ports.forEach(port => {
        sessionStorage.removeItem(`user_${port}`);
      });
      clearSessionMeta();

      setUser(null);
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
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
