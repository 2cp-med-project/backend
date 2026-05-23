import { createServer } from "http";

import "dotenv/config";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

import connectDB from "./config/db.js";
import routes from "./routes.js";
import handleSockets from "./modules/chat/chat.socket.js";
import { workflow } from "./modules/chatbot/chatbot.service.js";
import swaggerDoc from "../swagger.json" with { type: "json" };

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
	cors: { origin: "*", methods: ["GET", "POST"] },
});

app.set("io", io);

export const client = await connectDB();
const checkpointer = new MongoDBSaver({ client });

export const medicalAgentApp = workflow.compile({
	checkpointer,
});

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

app.use("/api", routes);
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerDoc, swaggerUiOptions),
);
app.get("/api", (req, res) => {
	res.status(200).json({ message: "API is running..." });
});

handleSockets(io);
const PORT = 5000;

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
