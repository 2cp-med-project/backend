import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { workflow } from "../modules/chatbot/chatbot.service.js";

let medicalAgentApp;

function initializeMedicalAgentApp(client) {
	const checkpointer = new MongoDBSaver({ client });
	medicalAgentApp = workflow.compile({ checkpointer });
	console.log("✅ Medical Agent App initialized.");
	return medicalAgentApp;
}

function getMedicalAgentApp() {
	if (!medicalAgentApp) {
		throw new Error("Medical Agent App not initialized.");
	}
	return medicalAgentApp;
}

export { initializeMedicalAgentApp, getMedicalAgentApp };
