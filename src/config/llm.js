import { ChatOpenAI } from "@langchain/openai";

export const tinyLLM = new ChatOpenAI({
	modelName: "liquid/lfm-2.5-1.2b-instruct:free",
	configuration: {
		baseURL: "https://openrouter.ai/api/v1",
		defaultHeaders: {
			"X-Title": "HealBot, a Medical AI Agent",
		},
	},
});

export const LLM = new ChatOpenAI({
	modelName: "google/gemma-4-26b-a4b-it:nitro",
	configuration: {
		baseURL: "https://openrouter.ai/api/v1",
		defaultHeaders: {
			"X-Title": "HealBot, a Medical AI Agent",
		},
	},
});
