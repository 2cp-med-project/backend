import "dotenv/config";
import { createServer } from "http";

import express from "express";
import cors from "cors";

import catchInvalidJSON from "./utils/helper.js";
import connectDB from "./config/db.js";
// import redis from "./config/redis.js";
import registerSwagger from "./config/swagger.js";
import agent from "./config/agent.js";
import routes from "./routes.js";
import authMiddleware from "./middleware/auth.js";
import { initSocket } from "./config/socket.js";
import handleSockets from "./modules/chat/chat.socket.js";
import startScheduler from "./modules/notifications/channels/scheduler.js";
import "./modules/notifications/channels/push.js";

const app = express();

// redis.connectRedis(redis.redisClient);

app.use(express.json());
app.use(cors());

registerSwagger(app);

app.use(catchInvalidJSON);
app.use("/api", routes);

const client = await connectDB();
agent.initializeMedicalAgentApp(client);

const server = createServer(app);
const io = initSocket(server);
io.use(authMiddleware.socketAuthenticate);

handleSockets(io);
app.set("io", io);
startScheduler();

// if (redisClient.isOpen) {
// 	await redisClient.quit();
// }
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
	console.log("🛑 Shutting down gracefully...");
	server.close(() => {
		console.log("HTTP server closed.");
		process.exit(0);
	});
});

export default app;
