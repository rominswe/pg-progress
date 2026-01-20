import redisClient from "../config/redis.js";

const HIPO_API_URL = "http://universities.hipolabs.com/search";
const CACHE_TTL = 86400; // 24 hours in seconds

/**
 * Search universities using Hipo Labs API with Redis caching
 */
export const searchUniversities = async (query) => {
    if (!query || query.length < 2) return [];

    const cacheKey = `univ:search:${query.toLowerCase().trim()}`;

    try {
        // 1. Check Cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // 2. Fetch from API
        const response = await fetch(`${HIPO_API_URL}?name=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Hipo API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // 3. Normalize & Store in Cache
        const normalizedData = data.map(item => ({
            name: item.name,
            country: item.country,
            domains: item.domains || []
        }));

        await redisClient.set(cacheKey, JSON.stringify(normalizedData), {
            EX: CACHE_TTL
        });

        return normalizedData;
    } catch (err) {
        console.error("[UniversityService] Error searching universities:", err);
        return [];
    }
};
