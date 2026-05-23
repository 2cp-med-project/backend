import { createServer } from "http";
import "dotenv/config";

import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { createClient } from "redis";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

import connectDB from "./config/db.js";
import routes from "./routes.js";
import handleSockets from "./modules/chat/chat.socket.js";
import { workflow } from "./modules/chatbot/chatbot.service.js";
import swaggerDoc from "../swagger.json" with { type: "json" };

const PORT = 5000;
const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
	cors: { origin: "*", methods: ["GET", "POST"] },
});
app.set("io", io);

const client = await connectDB();
const checkpointer = new MongoDBSaver({ client });
export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("connect", () =>
	console.log("🔄 Connecting to Docker Redis..."),
);
redisClient.on("ready", () => console.log("✅ Redis client is ready to use"));
redisClient.on("error", (error) =>
	console.error("❌ Redis Client Error:", error),
);
redisClient.on("end", () => console.warn("⚠️ Redis client connection closed"));

await redisClient.connect().catch(console.error);

export const medicalAgentApp = workflow.compile({ checkpointer });

app.use(express.json());
app.use(cors());

const swaggerUiOptions = {
	customCssUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
	customJs: [
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
	],
};

app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerDoc, swaggerUiOptions),
);
app.use("/api", routes);

app.get("/api", (req, res) =>
	res.status(200).json({ message: "API is running..." }),
);
app.get("/health", (req, res) =>
	res.status(200).json({ status: "OK", timestamp: new Date() }),
);

handleSockets(io);

httpServer.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
	console.log("🛑 Shutting down gracefully...");

	if (redisClient.isOpen) {
		await redisClient.quit();
	}

	httpServer.close(() => {
		console.log("HTTP server closed.");
		process.exit(0);
	});
});
