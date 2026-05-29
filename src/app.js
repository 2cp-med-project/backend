import { createServer } from "http";
import "dotenv/config";

import express from "express";
import cors from "cors";

import { catchInvalidJSON } from "./utils/helper.js";
import { connectDB } from "./config/db.js";
import { createSocketServer } from "./config/socket.js";
// import { redisClient, connectRedis } from "./config/redis.js";
import { registerSwagger } from "./config/swagger.js";
import agent from "./config/agent.js";
import handleSockets from "./modules/chat/chat.socket.js";
import routes from "./routes.js";

const PORT = 5000;
const app = express();

const httpServer = createServer(app);
const io = createSocketServer(httpServer);
app.set("io", io);

const client = await connectDB();

agent.initializeMedicalAgentApp(client);

// connectRedis(redisClient);

app.use(express.json());
app.use(cors());

registerSwagger(app);

app.use(catchInvalidJSON);
app.use("/api", routes);

handleSockets(io);
httpServer.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
	console.log("🛑 Shutting down gracefully...");

	// if (redisClient.isOpen) {
	// 	await redisClient.quit();
	// }

	httpServer.close(() => {
		console.log("HTTP server closed.");
		process.exit(0);
	});
});
