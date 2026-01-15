import { createClient } from "redis";
import dotenv from "dotenv";
import path from "node:path"

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on("error", (err) => {
  // Only log non-connection errors to avoid spamming console in dev without Redis
  if (err.code !== 'ECONNREFUSED') {
    console.error("Redis Client Error", err);
  }
});

try {
  // Race connection against a 2s timeout to prevent hanging
  const connectPromise = redisClient.connect();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Redis connection timeout")), 2000)
  );

  await Promise.race([connectPromise, timeoutPromise]);
} catch (e) {
  // If it failed or timed out, we just disconnect to be safe and let the app use MemoryStore
  // (disconnect ensures no background retries keep verifying)
  if (redisClient.isOpen) await redisClient.disconnect();
  console.warn("⚠️  Redis connection failed or timed out. Application will fall back to MemoryStore.");
}

export default redisClient;