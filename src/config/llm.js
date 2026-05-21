import { ChatOpenAI } from "@langchain/openai";

const LLM = new ChatOpenAI({
	modelName: "google/gemini-3.1-flash-lite",
	configuration: {
		baseURL: "https://openrouter.ai/api/v1",
		defaultHeaders: {
			"X-Title": "HealBot, a Medical AI Agent",
		},
	},
});

export default LLM;
