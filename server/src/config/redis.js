import { createClient } from "redis";
import dotenv from "dotenv";

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

// Fallback to .env if environment-specific file doesn't exist
if (!process.env.REDIS_HOST) {
  dotenv.config({ path: '.env' });
}

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

export default redisClient;