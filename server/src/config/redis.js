import { createClient } from "redis";
import dotenv from "dotenv";
import path from "node:path"

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

export default redisClient;