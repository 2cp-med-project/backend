import { medicalAgentApp } from "../../app.js";
import { LLM } from "../../config/llm.js";
import { formatMessages } from "./chatbot.tools.js";
import { Conversation } from "./conversation.model.js";
import { HumanMessage } from "@langchain/core/messages";

const getConfig = (thread_id) => ({ configurable: { thread_id } });

async function startChat(req, res) {
	try {
		const { prompt, patientId } = req.body;

		if (!patientId)
			return res
				.status(400)
				.json({ success: false, error: "patientId is required" });
		if (!prompt)
			return res
				.status(400)
				.json({ success: false, error: "prompt is required" });

		const conversation = new Conversation({
			userId: patientId,
			title: "New Chat",
		});
		const thread_id = conversation.id;

		const titlePrompt = `3–5 word Title Case chat title. Output the title only.\nChat: ${prompt}`;
		const [titleResponse, state] = await Promise.all([
			LLM.invoke(titlePrompt).catch(() => ({ content: "New Chat" })),
			medicalAgentApp.invoke(
				{
					patientId,
					messages: [new HumanMessage(prompt)],
				},
				getConfig(thread_id),
			),
		]);

		conversation.title =
			titleResponse.content.toString().trim() || "New Chat";
		await conversation.save();

		const response = state.messages?.at(-1);
		if (!response) throw new Error("Agent returned no response");

		console.log(
			`${logTag()} 🚀 startChat: thread=${thread_id} | messages=${state.messages?.length ?? 0}`,
		);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: response.content,
		});
	} catch (err) {
		console.error("[startChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
}

async function handleChat(req, res) {
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

		// await waitForSummarization(thread_id);

		const existingState = await medicalAgentApp.getState(
			getConfig(thread_id),
		);
		const patientId = existingState.values?.patientId;

		const state = await medicalAgentApp.invoke(
			{
				patientId,
				messages: [new HumanMessage(prompt)],
			},
			getConfig(thread_id),
		);

		const response = state.messages?.at(-1);
		if (!response) throw new Error("Agent returned no response");

		console.log(
			`${logTag()} 💬 handleChat: thread=${thread_id} | messages=${state.messages?.length ?? 0}`,
		);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: response.content,
		});
	} catch (err) {
		console.error("[handleChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
}

async function retrieveChat(req, res) {
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
			history: formatMessages(state.values?.messages),
		});
	} catch (err) {
		console.error("[retrieveChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
}

async function deleteChat(req, res) {
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

		console.log(`${logTag()} 🗑️  deleteChat: thread=${thread_id}`);

		return res.json({ success: true });
	} catch (err) {
		console.error("[deleteChat] error:", err);
		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
}

function logTag() {
	return `[${new Date().toLocaleTimeString()}]`;
}

export default { startChat, handleChat, retrieveChat, deleteChat };
