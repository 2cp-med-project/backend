import { StateGraph, START, END } from "@langchain/langgraph";
import chatbotSchema from "./chatbot.schema.js";
import chatbotNodes from "./chatbot.nodes.js";

const tag = () => `[${new Date().toLocaleTimeString()}]`;

async function invokeStructured(
	structuredLlm,
	messages,
	{ maxAttempts = 3, label = "structured" } = {},
) {
	let lastError;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const result = await structuredLlm.invoke(messages);
			if (
				!result ||
				typeof result !== "object" ||
				!Object.keys(result).length
			) {
				throw new Error("Empty structured output");
			}
			return result;
		} catch (err) {
			lastError = err;
			console.warn(
				`${tag()} ⚠️  ${label} attempt ${attempt}/${maxAttempts} failed: ${err.message}`,
			);
			if (attempt < maxAttempts)
				await new Promise((r) => setTimeout(r, 500 * attempt));
		}
	}
	throw lastError;
}

const workflow = new StateGraph(chatbotSchema.MedicalAgentAnnotation)
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

export { tag, invokeStructured, workflow };
