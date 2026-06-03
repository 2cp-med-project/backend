import swaggerAutogen from "swagger-autogen";

const outputFile = "../../swagger.json";
const endpointsFiles = ["../app.js"];
const doc = {
	info: {
		title: "2CP API Documentation",
		version: "1.0.0",
		description: "API documentation for the 2CP project",
	},
	servers: [
		{
			url: "http://localhost:5000",
			description: "Development server",
		},
	],
	components: {
		securitySchemes: {
			BearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
	},
};

const autogen = swaggerAutogen({ openapi: "3.0.0" });
autogen(outputFile, endpointsFiles, doc);
