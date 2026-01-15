import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { sequelize } from "./config/config.js";
import { sessionMiddleware } from "./app.js";
import redisClient from "./config/redis.js";

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
io.on("connection", async (socket) => {
  const session = socket.request.session;

  if (!session?.user?.id) {
    console.log("❌ Unauthorized socket connection");
    return socket.disconnect();
  }

  const userId = session.user.id;
  const stateKey = `ws_state:${userId}`;

  console.log(`🔌 Socket connected: user ${session.userId}`);

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
    console.log(`🔌 Socket disconnected: user ${session.userId}`);
  });
});

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
    console.error(`   👉 Hint: Ensure Docker is running and MySQL is exposed on port ${process.env.DB_PORT}`);
    retries--;
    await new Promise((res) => setTimeout(res, 3000));
  }
}
