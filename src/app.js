import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { workflow } from "./modules/chatbot/chatbot.service.js";

import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../swagger.json" with { type: "json" };

import routes from "./routes.js";
import { handleSocketConnection } from "./modules/chat/socket.controller.js";

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB
export const client = await connectDB();

// Initialize MongoDB checkpointer
const checkpointer = new MongoDBSaver({ client });

// Initialize AI Agent
export const medicalAgentApp = workflow.compile({ checkpointer });

// Initialize HTTP Server
const httpServer = createServer(app);

// Initialize SocketIO Server
const io = new SocketIOServer(httpServer, {
	cors: { origin: "*", methods: ["GET", "POST"] },
});

// Handle Socket Connection
handleSocketConnection(io);

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

// Load Main Routes
app.use("/api", routes);

// Start Server
httpServer.listen(process.env.PORT, () =>
	console.log(`Server running on port ${process.env.PORT}`),
);
