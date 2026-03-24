import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const swaggerOptions = require("../swagger.json");

import routes from "./routes.js";

// Load ENV
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

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

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});


export default app;