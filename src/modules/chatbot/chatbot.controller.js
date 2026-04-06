import { medicalAgentApp } from "../../app.js";
import { HumanMessage } from "@langchain/core/messages";
import { Conversation } from "./conversation.model.js";
import { LLM } from "../../config/llm.js";

const getConfig = (thread_id) => ({ configurable: { thread_id } });

const formatMessages = (messages) => {
	if (!Array.isArray(messages)) return [];
	return messages
		.filter((m) => m._getType() !== "system")
		.map((m) => ({
			role: m._getType() === "human" ? "user" : "assistant",
			content: m.content,
		}));
};

export const startChat = async (req, res) => {
	try {
		const { prompt, patientId } = req.body;

		if (!prompt)
			return res
				.status(400)
				.json({ success: false, error: "prompt is required" });
		if (!patientId)
			return res
				.status(400)
				.json({ success: false, error: "patientId is required" });

		const conversation = new Conversation({
			userId: patientId,
			title: "New Chat",
		});
		const thread_id = conversation.id;

		const titlePrompt =
			`Generate a concise 2-5 word title for this medical chat: "${prompt}". ` +
			`Return ONLY the title text, no quotes, no explanation. Capitalize major words.`;

		const [titleResponse, state] = await Promise.all([
			LLM.invoke(titlePrompt).catch(() => ({
				content: "Medical Consultation",
			})),
			medicalAgentApp.invoke(
				{ patientId, activeMessages: [new HumanMessage(prompt)] },
				getConfig(thread_id),
			),
		]);

		conversation.title =
			titleResponse.content.toString().trim() || "New Chat";
		await conversation.save();

		const lastMessage = state.activeMessages?.at(-1);
		if (!lastMessage) throw new Error("Agent returned no response");

		console.log(
			`[${new Date().toLocaleTimeString()}] 🚀 startChat: thread=${thread_id} summaryBlocks=${state.summaryBlocks?.length ?? 0}`,
		);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: lastMessage.content,
		});
	} catch (err) {
		console.error("[startChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};

export const handleChat = async (req, res) => {
	try {
		const { thread_id } = req.params;
		const { prompt } = req.body;

		if (!prompt)
			return res
				.status(400)
				.json({ success: false, error: "prompt is required" });

		const conversation = await Conversation.findById(thread_id).lean();
		if (!conversation)
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });

		const state = await medicalAgentApp.invoke(
			{ activeMessages: [new HumanMessage(prompt)] },
			getConfig(thread_id),
		);

		const lastMessage = state.activeMessages?.at(-1);
		if (!lastMessage) throw new Error("Agent returned no response");

		console.log(
			`[${new Date().toLocaleTimeString()}] 💬 handleChat: thread=${thread_id} activeMessages=${state.activeMessages.length}`,
		);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: lastMessage.content,
		});
	} catch (err) {
		console.error("[handleChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};

export const retrieveChat = async (req, res) => {
	try {
		const { thread_id } = req.params;

		const conversation = await Conversation.findById(thread_id).lean();
		if (!conversation)
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });

		const state = await medicalAgentApp.getState(getConfig(thread_id));

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			history: formatMessages(state.values?.activeMessages),
		});
	} catch (err) {
		console.error("[retrieveChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};

export const deleteChat = async (req, res) => {
	try {
		const { thread_id } = req.params;

		const conversation = await Conversation.findById(thread_id);
		if (!conversation)
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });

		await Promise.all([
			conversation.deleteOne(),
			medicalAgentApp.checkpointer.deleteThread(thread_id),
		]);

		console.log(
			`[${new Date().toLocaleTimeString()}] 🗑️  deleteChat: thread=${thread_id}`,
		);

		return res.json({ success: true });
	} catch (err) {
		console.error("[deleteChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
};
