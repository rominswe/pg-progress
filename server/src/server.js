import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { sequelize } from "./config/config.js";
import { sessionMiddleware } from "./app.js";
import redisClient from "./config/redis.js";
import calendarService from "./services/calendarService.js";

/* ================= HTTP + SOCKET ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_USER_URL, process.env.FRONTEND_ADMIN_URL],
    credentials: true,
  },
});

// Share session with Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

/* ================= SOCKET LOGIC ================= */
let ioInstance;

export const getIO = () => ioInstance;

const setupSocket = (io) => {
  ioInstance = io;

  io.on("connection", async (socket) => {
    const session = socket.request.session;

    if (!session?.user?.id) {
      return socket.disconnect();
    }

    const userId = session.user.id;
    const roleId = session.user.role_id;
    const stateKey = `ws_state:${userId}`;

    // Join private room for targeted notifications
    socket.join(`user:${userId}`);
    // Join role-based room for broadcast notifications
    if (roleId) socket.join(`role:${roleId}`);

    // console.log(`🔌 Socket connected: user ${userId} joined room user:${userId}`);

    // 🔁 Restore state on refresh / reconnect
    const savedState = await redisClient.get(stateKey);
    socket.emit("STATE_SYNC", savedState ? JSON.parse(savedState) : {
      step: "START",
      progress: 0,
    });

    // 🔄 Update & persist state
    socket.on("UPDATE_STATE", async (newState) => {
      await redisClient.set(stateKey, JSON.stringify(newState));
      socket.emit("STATE_SYNC", newState);
    });

    socket.on("disconnect", () => {
      // console.log(`🔌 Socket disconnected: user ${userId}`);
    });
  });

  // AUTHORITATIVE TIME SYNC HEARTBEAT (Every 30 seconds)
  setInterval(() => {
    io.emit("TIME_SYNC", {
      serverTime: new Date().toISOString(),
    });
  }, 30000);

  // ⏰ DEADLINE MONITORING HEARTBEAT (Every 24 hours)
  setInterval(() => {
    calendarService.checkUpcomingDeadlines();
  }, 1000 * 60 * 60 * 24);

  // Trigger initial check after a short delay to ensure DB is ready
  setTimeout(() => {
    calendarService.checkUpcomingDeadlines();
  }, 60000);
};

setupSocket(io);

/* ================= START SERVER ================= */
const PORT = process.env.PORT;

let retries = 5;

while (retries) {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync();
    console.log("✅ Database synced");

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

    break;
  } catch (err) {
    console.error(
      `❌ DB connection failed. Retries left: ${retries - 1}`,
      err.message
    );
    console.error(` 👉 Hint: Ensure Docker is running and MySQL is exposed on port ${process.env.DB_PORT}`);
    retries--;
    await new Promise((res) => setTimeout(res, 3000));
  }
}
