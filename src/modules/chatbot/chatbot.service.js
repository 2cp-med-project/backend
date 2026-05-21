import { StateGraph, START, END } from "@langchain/langgraph";
import { MedicalAgentAnnotation } from "./chatbot.schema.js";
import chatbotNodes from "./chatbot.nodes.js";

export const workflow = new StateGraph(MedicalAgentAnnotation)
	.addNode("safeguardNode", chatbotNodes.safeguardNode, {
		ends: ["handleUnsafe", "handleNonMedical", "classifyPrompt"],
	})
	.addNode("classifyPrompt", chatbotNodes.classifyPrompt, {
		ends: ["handleUrgent", "formulateQueries", "handleMedical"],
	})
	.addNode("formulateQueries", chatbotNodes.formulateQueries, {
		ends: ["retrieveData"],
	})
	.addNode("retrieveData", chatbotNodes.retrieveData, {
		ends: ["handleMedical"],
	})
	.addNode("handleMedical", chatbotNodes.handleMedical, { ends: [END] })
	.addNode("handleNonMedical", chatbotNodes.handleNonMedical, { ends: [END] })
	.addNode("handleUrgent", chatbotNodes.handleUrgent, { ends: [END] })
	.addNode("handleUnsafe", chatbotNodes.handleUnsafe, { ends: [END] })
	.addEdge(START, "safeguardNode");
