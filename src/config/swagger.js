import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../../swagger.json" with { type: "json" };

const swaggerUiOptions = {
	customCssUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
	customJs: [
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
		"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
	],
};

function registerSwagger(app) {
	app.use(
		"/api-docs",
		swaggerUi.serve,
		swaggerUi.setup(swaggerDoc, swaggerUiOptions),
	);
}

export default registerSwagger;
