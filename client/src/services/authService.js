import axios from "axios";

export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/auth/login`, credentials);
  localStorage.setItem("token", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);
  localStorage.setItem("role", res.data.role);
  return res.data;
};

export const refreshToken = async () => {
  const token = localStorage.getItem("refreshToken");
  if (!token) return null;
  const res = await axios.post(`${API_URL}/auth/refresh`, { token });
  localStorage.setItem("token", res.data.accessToken);
  return res.data.accessToken;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
};
