import { TavilySearch } from "@langchain/tavily";

export const searchTool = new TavilySearch({
	maxResults: 3,
	topic: "general",
	searchDepth: "advanced",
	includeAnswer: true,
	includeRawContent: false,
	includeDomains: [
		"nih.gov",
		"cdc.gov",
		"who.int",
		"mayoclinic.org",
		"clevelandclinic.org",
		"hopkinsmedicine.org",
		"medlineplus.gov",
		"jamanetwork.com",
		"thelancet.com",
		"nejm.org",
		"bmj.com",
	],
});
