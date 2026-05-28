import { HumanMessage } from "@langchain/core/messages";

import { getMedicalAgentApp } from "../../config/agent.js";
import { LLM } from "../../config/llm.js";
import Conversation from "./conversation.model.js";

const getConfig = (thread_id) => ({ configurable: { thread_id } });

function formatMessages(messages) {
	if (!Array.isArray(messages)) return [];

	return messages
		.filter((m) => m._getType() !== "system")
		.map((m) => ({
			role: m._getType() === "human" ? "user" : "assistant",
			content: m.content,
		}));
}

async function startChat(req, res) {
	// #swagger.tags = ['Chatbot']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Start a new chat'
	// #swagger.description = 'Roles: patient'

	const { id } = req.user;
	const { prompt } = req.body;

	if (!id) return res.status(400).json({ error: "patient id is required" });
	if (!prompt) return res.status(400).json({ error: "prompt is required" });

	const medicalAgentApp = getMedicalAgentApp();

	const conversation = new Conversation({
		userId: id,
		title: "Nouvelle conversation",
	});
	const threadId = conversation.id;
	const config = getConfig(threadId);

	try {
		const titlePrompt = `Générez un titre court (3 à 5 mots) pour cette conversation. Ne renvoyez QUE le titre.\nMessage : ${prompt}`;

		const [titleResponse, state] = await Promise.all([
			LLM.invoke(titlePrompt).catch(() => ({
				content: "Nouvelle conversation",
			})),
			medicalAgentApp.invoke(
				{ userId: id, messages: [new HumanMessage(prompt)] },
				config,
			),
		]);

		const response = state.messages?.at(-1);
		if (!response) throw new Error("Agent returned no response");

		conversation.title =
			titleResponse.content.toString().trim() || "Nouvelle conversation";
		await conversation.save();

		console.log(`${logTag()} 🚀 startChat: thread=${threadId}`);

		return res.json({
			threadId,
			title: conversation.title,
			response: response.content,
		});
	} catch (error) {
		console.error(
			"[startChat] error, rolling back graph state:",
			error.message,
		);

		try {
			await medicalAgentApp.checkpointer.deleteThread(threadId);
		} catch (cleanupErr) {
			console.error(
				"[startChat] Failed to clean up checkpointer:",
				cleanupErr,
			);
		}

		return res.status(500).json({ error: "Internal Server Error" });
	}
}

async function handleChat(req, res) {
	// #swagger.tags = ['Chatbot']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = "Send a new message to an existing chat and get the agent's response"
	// #swagger.description = 'Roles: patient'
	// #swagger.parameters['threadId'] = { description: 'The ID of the conversation thread.' }

	const { id } = req.user;
	const { threadId } = req.params;
	const { prompt } = req.body;

	if (!threadId)
		return res.status(400).json({ error: "threadId is required" });
	if (!prompt) return res.status(400).json({ error: "prompt is required" });

	const conversation = await Conversation.findById(threadId).lean();
	if (!conversation || String(conversation.userId) !== String(id)) {
		return res.status(404).json({ error: "Conversation not found" });
	}

	const medicalAgentApp = getMedicalAgentApp();

	const config = getConfig(threadId);
	const preRunState = await medicalAgentApp.getState(config);

	try {
		const state = await medicalAgentApp.invoke(
			{ userId: id, messages: [new HumanMessage(prompt)] },
			config,
		);

		const response = state.messages?.at(-1);
		if (!response) throw new Error("Agent returned no response");

		console.log(`${logTag()} 💬 handleChat: thread=${threadId}`);

		return res.json({
			threadId,
			title: conversation.title,
			response: response.content,
		});
	} catch (error) {
		console.error(
			"[handleChat] error, rolling back graph state:",
			error.message,
		);

		try {
			if (preRunState && preRunState.values) {
				await medicalAgentApp.updateState(config, preRunState.values);
			} else {
				await medicalAgentApp.checkpointer.deleteThread(threadId);
			}
		} catch (cleanupErr) {
			console.error("[handleChat] Failed to revert state:", cleanupErr);
		}

		return res.status(500).json({ error: "Internal Server Error" });
	}
}

async function retrieveAllChats(req, res) {
	// #swagger.tags = ['Chatbot']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Retrieve user chat history'
	// #swagger.description = 'Roles: patient'

	const { id } = req.user;

	try {
		const conversations = await Conversation.find({ userId: id })
			.select("_id userId title")
			.sort({ updatedAt: -1 })
			.lean();

		return res
			.status(200)
			.json({ success: true, chats: conversations || [] });
	} catch (error) {
		console.error("[retrieveAllChats] error:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}

async function retrieveChat(req, res) {
	// #swagger.tags = ['Chatbot']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Fetch the entire message history and title of a specific chat'
	// #swagger.description = 'Roles: patient'
	// #swagger.parameters['threadId'] = { description: 'The ID of the conversation thread to retrieve.' }

	const { id } = req.user;
	const { threadId } = req.params;

	try {
		if (!threadId)
			return res.status(400).json({ error: "threadId is required" });

		const conversation = await Conversation.findById(threadId).lean();
		if (!conversation || String(conversation.userId) !== String(id)) {
			return res.status(404).json({ error: "Conversation not found" });
		}
		const medicalAgentApp = getMedicalAgentApp();
		const state = await medicalAgentApp.getState(getConfig(threadId));

		return res.status(200).json({
			threadId,
			title: conversation.title,
			history: formatMessages(state.values?.messages || []),
		});
	} catch (error) {
		console.error("[retrieveChat] error:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}

async function deleteChat(req, res) {
	// #swagger.tags = ['Chatbot']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Permanently delete a chat from the database'
	// #swagger.description = 'Roles: patient'
	// #swagger.parameters['threadId'] = { description: 'The ID of the conversation thread to delete.' }

	const { id } = req.user;
	const { threadId } = req.params;

	try {
		if (!threadId)
			return res.status(400).json({ error: "threadId is required" });

		const conversation = await Conversation.findOneAndDelete({
			_id: threadId,
			userId: id,
		});

		if (!conversation) {
			return res.status(404).json({ error: "Conversation not found" });
		}

		const medicalAgentApp = getMedicalAgentApp();
		await medicalAgentApp.checkpointer.deleteThread(threadId);

		console.log(`${logTag()} 🗑️  deleteChat: thread=${threadId}`);

		return res.json({ success: true });
	} catch (error) {
		console.error("[deleteChat] error:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}

function logTag() {
	return `[${new Date().toLocaleTimeString()}]`;
}

export default {
	retrieveAllChats,
	retrieveChat,
	startChat,
	handleChat,
	deleteChat,
};
