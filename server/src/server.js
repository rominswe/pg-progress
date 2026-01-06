import http from "http";
import app from "./app.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./config/redis.js";
import { Server } from "socket.io";
import { sequelize } from "./config/config.js";

/* ================= SESSION (SHARED) ================= */
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  name: "sid",
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 3, // 3 hours
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});

// Attach session to Express
app.use(sessionMiddleware);

/* ================= HTTP + SOCKET ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
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

  if (!session?.userId) {
    console.log("❌ Unauthorized socket connection");
    return socket.disconnect();
  }

  const stateKey = `ws_state:${session.userId}`;

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
const PORT = process.env.PORT || 5000;

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
    retries--;
    await new Promise((res) => setTimeout(res, 3000));
  }
}
