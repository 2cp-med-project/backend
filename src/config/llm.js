import { ChatOpenAI } from "@langchain/openai";

export const LLM = new ChatOpenAI({
	modelName: "",
	configuration: {
		baseURL: "http://127.0.0.1:8080",
		defaultHeaders: {
			"X-Title": "HealBot, a Medical AI Agent",
		},
	},
});
