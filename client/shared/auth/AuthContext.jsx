// import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import { authService } from "../services/api";

// const AuthContext = createContext(null);

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // Fetch current user on mount
// //   const fetchMe = useCallback(async () => {
// //   try {
// //     const data = await authService.me();
// //     setUser(data.user);
// //   } catch (err) {
// //     if (err.response?.status === 401) {
// //       try {
// //         const { accessToken } = await authService.refresh();
// //         api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
// //         const data = await authService.me();
// //         setUser(data.user);
// //       } catch {
// //         setUser(null);
// //       }
// //     } else {
// //       setUser(null);
// //     }
// //   } finally {
// //     setLoading(false);
// //   }
// // }, []);

// //   // const fetchMe = useCallback(async () => {
// //   //   try {
// //   //     const data = await authService.me();
// //   //     setUser(data.user);
// //   //   } catch {
// //   //     setUser(null);
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // }, []);

// //  const didFetch = React.useRef(false);

// // useEffect(() => {
// //   if (didFetch.current) return;
// //   didFetch.current = true;
// //   fetchMe();
// // }, [fetchMe]);


// //   // Login function
// //   const login = useCallback(async (role, credentials) => {
// //     const data = await authService.login(role, credentials);
// //     setUser(data.user);
// //     return data;
// //   }, []);

// //   // Logout function
// //   const logout = async () => {
// //   setLoading(true);
// //   try {
// //     await authService.logout();
// //   } finally {
// //     setUser(null);
// //     setLoading(false);
// //   }
// // };


// //   const value = { user, loading, login, logout, setUser };

// //   return (
// //     <AuthContext.Provider value={value}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // Named export only

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     authService
//       .me()
//       .then((res) => setUser(res.data.user))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   const logout = async () => {
//     await authService.logout();
//     setUser(null);
//   };
  
// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from "react";
import {authService} from "../services/api";
// window.authService = authService;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (role, credentials) => {
  const data = await authService.login(role, credentials);
  setUser(data.user); // update context user
  return data;
};

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);