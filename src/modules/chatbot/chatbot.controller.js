import { medicalAgentApp } from "../../app.js";
import { HumanMessage } from "@langchain/core/messages";
import { Conversation } from "./conversation.model.js";
import { fastLLM } from "../../config/llm.js";

const formatMessages = (messages) =>
	messages
		.filter((m) => m._getType() !== "system")
		.map((m) => ({
			role: m._getType() === "human" ? "user" : "assistant",
			content: m.content,
		}));

const getConfig = (thread_id) => ({ configurable: { thread_id } });

export const startChat = async (req, res) => {
	try {
		const { prompt } = req.body;
		if (!prompt) {
			return res
				.status(400)
				.json({ success: false, error: "prompt is required" });
		}

		const titlePrompt = `
        Please generate a concise, descriptive title for the following chat conversation: "${prompt}".

        Instructions for your response:
        1. Length: Keep the title strictly between 2 to 5 words.
        2. Format: Return ONLY the raw title text. Do not include quotes, periods, or any introductory filler text.
        3. Capitalization: Capitalize the first letter of each major word.
        4. Clarity: Accurately capture the core medical topic, symptom, or question.
        `.trim();

		const titleResponse = await fastLLM.invoke(titlePrompt);

		const conversation = await Conversation.create({
			userId: 2,
			title: titleResponse.content.toString().trim(),
		});

		req.params.thread_id = conversation.id;
		return handleChat(req, res);
	} catch (error) {
		console.error("Error in startChat:", error);

		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};

export const handleChat = async (req, res) => {
	try {
		const { thread_id } = req.params;
		const { prompt } = req.body;

		if (!prompt) {
			return res
				.status(400)
				.json({ success: false, error: "prompt is required" });
		}

		const conversation = await Conversation.findById(thread_id);
		if (!conversation) {
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });
		}

		const state = await medicalAgentApp.invoke(
			{ messages: [new HumanMessage(prompt)] },
			getConfig(thread_id),
		);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: state.messages.at(-1).content,
		});
	} catch (error) {
		console.error("Error in handleChat:", error);

		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};

export const retrieveChat = async (req, res) => {
	try {
		const { thread_id } = req.params;

		const conversation = await Conversation.findById(thread_id);
		if (!conversation) {
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });
		}

		const state = await medicalAgentApp.getState(getConfig(thread_id));

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			history: formatMessages(state.values.messages),
		});
	} catch (error) {
		console.error("Error in retrieveChat:", error);

		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};

export const deleteChat = async (req, res) => {
	try {
		const { thread_id } = req.params;

		const conversation = await Conversation.findById(thread_id);
		if (!conversation) {
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });
		}

		await Promise.all([
			conversation.deleteOne(),
			medicalAgentApp.checkpointer.deleteThread(thread_id),
		]);

		return res.json({ success: true });
	} catch (error) {
		console.error("Error in deleteChat:", error);

		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};
