import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.API_BASE_URL;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🔌 Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔌 Socket disconnected");
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});