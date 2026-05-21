import { success } from "zod";
import { HumanMessage } from "@langchain/core/messages";

import { medicalAgentApp } from "../../app.js";
import chatbotTools from "./chatbot.tools.js";
import Conversation from "./conversation.model.js";
import LLm from "../../config/llm.js";

const getConfig = (thread_id) => ({ configurable: { thread_id } });

async function startChat(req, res) {
	const { id } = req.user;
	const { prompt } = req.body;

	if (!id)
		return res
			.status(400)
			.json({ success: false, error: "patient id is required" });
	if (!prompt)
		return res
			.status(400)
			.json({ success: false, error: "prompt is required" });

	const conversation = new Conversation({ userId: id, title: "New Chat" });
	const thread_id = conversation.id;
	const config = getConfig(thread_id);

	try {
		const titlePrompt = `3–5 word Title Case chat title. Output the title only.\nChat: ${prompt}`;

		const [titleResponse, state] = await Promise.all([
			LLM.invoke(titlePrompt).catch(() => ({ content: "New Chat" })),
			medicalAgentApp.invoke(
				{ userId: id, messages: [new HumanMessage(prompt)] },
				config,
			),
		]);

		const response = state.messages?.at(-1);
		if (!response) throw new Error("Agent returned no response");

		conversation.title =
			titleResponse.content.toString().trim() || "New Chat";
		await conversation.save();

		console.log(`${logTag()} 🚀 startChat: thread=${thread_id}`);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: response.content,
		});
	} catch (err) {
		console.error("[startChat] error, rolling back:", err);

		try {
			await medicalAgentApp.checkpointer.deleteThread(thread_id);
		} catch (cleanupErr) {
			console.error(
				"[startChat] Failed to clean up checkpointer:",
				cleanupErr,
			);
		}

		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
}

async function handleChat(req, res) {
	const { id } = req.user;
	const { thread_id } = req.params;
	const { prompt } = req.body;

	if (!thread_id)
		return res
			.status(400)
			.json({ success: false, error: "thread_id is required" });
	if (!prompt)
		return res
			.status(400)
			.json({ success: false, error: "prompt is required" });

	const conversation = await Conversation.findById(thread_id).lean();
	if (!conversation || String(conversation.userId) !== String(id)) {
		return res
			.status(404)
			.json({ success: false, error: "Conversation not found" });
	}

	const config = getConfig(thread_id);
	const preRunState = await medicalAgentApp.getState(config);

	try {
		const state = await medicalAgentApp.invoke(
			{ userId: id, messages: [new HumanMessage(prompt)] },
			config,
		);

		const response = state.messages?.at(-1);
		if (!response) throw new Error("Agent returned no response");

		console.log(`${logTag()} 💬 handleChat: thread=${thread_id}`);

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			response: response.content,
		});
	} catch (err) {
		console.error("[handleChat] error, rolling back graph state:", err);

		try {
			if (preRunState && preRunState.values) {
				await medicalAgentApp.updateState(config, preRunState.values);
			} else {
				await medicalAgentApp.checkpointer.deleteThread(thread_id);
			}
		} catch (cleanupErr) {
			console.error("[handleChat] Failed to revert state:", cleanupErr);
		}

		return res
			.status(500)
			.json({ success: false, error: "Internal Server Error" });
	}
}

async function retrieveChat(req, res) {
	try {
		const { id } = req.user;
		const { thread_id } = req.params;

		if (!thread_id)
			return res
				.status(400)
				.json({ success: false, error: "thread_id is required" });

		const conversation = await Conversation.findById(thread_id).lean();
		if (!conversation || String(conversation.userId) !== String(id)) {
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });
		}

		const state = await medicalAgentApp.getState(getConfig(thread_id));

		return res.json({
			success: true,
			thread_id,
			title: conversation.title,
			history: chatbotTools.formatMessages(state.values?.messages || []),
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
		const { id } = req.user;
		const { thread_id } = req.params;

		if (!thread_id)
			return res
				.status(400)
				.json({ success: false, error: "thread_id is required" });

		const conversation = await Conversation.findOneAndDelete({
			_id: thread_id,
			userId: id,
		});

		if (!conversation) {
			return res
				.status(404)
				.json({ success: false, error: "Conversation not found" });
		}

		await medicalAgentApp.checkpointer.deleteThread(thread_id);

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
