let redisClient = null;
let redisReady = false;

const CACHE_PREFIX = "shorturl:redirect:";
const CACHE_TTL_SECONDS = Number(process.env.REDIS_CACHE_TTL_SECONDS || 3600);

function getCacheKey(shortId) {
    return `${CACHE_PREFIX}${shortId}`;
}

async function connectRedis() {
    if (redisClient || !process.env.REDIS_URL) {
        return;
    }

    try {
        const { createClient } = require("redis");
        redisClient = createClient({ url: process.env.REDIS_URL });

        redisClient.on("ready", () => {
            redisReady = true;
            console.log("Redis connected");
        });

        redisClient.on("error", (err) => {
            redisReady = false;
            console.error("Redis error:", err.message);
        });

        await redisClient.connect();
    } catch (err) {
        redisClient = null;
        redisReady = false;
        console.error("Redis setup failed:", err.message);
    }
}

async function getCachedRedirectUrl(shortId) {
    if (!redisClient || !redisReady) {
        return null;
    }

    try {
        return await redisClient.get(getCacheKey(shortId));
    } catch (err) {
        console.error("Redis GET failed:", err.message);
        return null;
    }
}

async function setCachedRedirectUrl(shortId, redirectedURL) {
    if (!redisClient || !redisReady || !redirectedURL) {
        return;
    }

    try {
        await redisClient.set(getCacheKey(shortId), redirectedURL, { EX: CACHE_TTL_SECONDS });
    } catch (err) {
        console.error("Redis SET failed:", err.message);
    }
}

async function deleteCachedRedirectUrl(shortId) {
    if (!redisClient || !redisReady) {
        return;
    }

    try {
        await redisClient.del(getCacheKey(shortId));
    } catch (err) {
        console.error("Redis DEL failed:", err.message);
    }
}

module.exports = {
    connectRedis,
    getCachedRedirectUrl,
    setCachedRedirectUrl,
    deleteCachedRedirectUrl,
};
