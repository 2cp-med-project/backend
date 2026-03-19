import { MedicalAgentAnnotation } from "./chatbot.schema.js";
import {
	classifyQuery,
	webSearch,
	handleUrgent,
	handleNonUrgent,
	handleGeneralQuestion,
} from "./chatbot.nodes.js";
import { StateGraph, START, END } from "@langchain/langgraph";

export const workflow = new StateGraph(MedicalAgentAnnotation)
	.addEdge(START, "classifyQuery")
	.addNode("classifyQuery", classifyQuery, {
		ends: ["handleUrgent", "webSearch", "handleGeneralQuestion"],
	})
	.addNode("webSearch", webSearch, {
		ends: ["handleUrgent", "handleNonUrgent", "handleGeneralQuestion"],
	})
	.addNode("handleUrgent", handleUrgent, { ends: [END] })
	.addNode("handleNonUrgent", handleNonUrgent, { ends: [END] })
	.addNode("handleGeneralQuestion", handleGeneralQuestion, { ends: [END] });
