import { StateGraph, START, END } from "@langchain/langgraph";
import { MedicalAgentAnnotation } from "./chatbot.schema.js";
import {
	manageMemory,
	safeguardNode,
	classifyPrompt,
	formulateQueries,
	retrieveData,
	handleMedical,
	handleNonMedical,
	handleUrgent,
	handleUnsafe,
} from "./chatbot.nodes.js";

export const workflow = new StateGraph(MedicalAgentAnnotation)
	.addNode("manageMemory", manageMemory, {
		ends: ["safeguardNode"],
	})
	.addNode("safeguardNode", safeguardNode, {
		ends: ["handleUnsafe", "handleNonMedical", "classifyPrompt"],
	})
	.addNode("classifyPrompt", classifyPrompt, {
		ends: ["handleUrgent", "formulateQueries", "handleMedical"],
	})
	.addNode("formulateQueries", formulateQueries, {
		ends: ["retrieveData"],
	})
	.addNode("retrieveData", retrieveData, {
		ends: ["handleMedical"],
	})
	.addNode("handleMedical", handleMedical, { ends: [END] })
	.addNode("handleNonMedical", handleNonMedical, { ends: [END] })
	.addNode("handleUrgent", handleUrgent, { ends: [END] })
	.addNode("handleUnsafe", handleUnsafe, { ends: [END] })
	.addEdge(START, "manageMemory");
