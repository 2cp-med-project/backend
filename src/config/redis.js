import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("connect", () =>
	console.log("🔄 Connecting to Docker Redis..."),
);
redisClient.on("ready", () => console.log("✅ Redis client is ready to use"));
redisClient.on("error", (error) =>
	console.error("❌ Redis Client Error:", error),
);
redisClient.on("end", () => console.warn("⚠️ Redis client connection closed"));

async function connectRedis(client) {
	if (client.isOpen) {
		console.log("✅ Redis client is already connected");
		return;
	}

	await client.connect().catch(console.error);
}

export default { redisClient, connectRedis };
