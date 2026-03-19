import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import connectDB from "./config/db.js";
import { workflow } from "./modules/chatbot/chatbot.service.js";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const swaggerOptions = require("../swagger.json");

import routes from "./routes.js";
import mongoose from "mongoose";

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const client = await connectDB();

// Initialize MongoDB checkpointer
const checkpointer = new MongoDBSaver({ client });

// Initialize AI Agent
export const medicalAgentApp = workflow.compile({ checkpointer });

// Swagger Docs
const specs = swaggerJsdoc({
	definition: swaggerOptions.definition,
	apis: swaggerOptions.apis,
});

const swaggerUiOptions = {
	customCssUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
	customJs: [
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
	],
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Load Main Routes
app.use("/api", routes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
