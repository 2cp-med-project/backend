import { SystemMessage } from "@langchain/core/messages";

import Consultation from "../records/consultation.model.js";

import { LLM } from "../../config/llm.js";
import { formatConsultation } from "../records/consultation.service.js";

const LANGUAGE = "FRENCH";

async function summarize(req, res) {
	// #swagger.tags = ['Summary']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Summarize a consultation'
	// #swagger.description = 'Roles: doctor, patient'

	const { id } = req.user;
	const { consultationId } = req.params;

	if (!consultationId)
		return res.status(400).json({ error: "consultationId is required" });

	const consultation = await Consultation.findOne({
		_id: consultationId,
		patientId: id,
	});

	if (!consultation)
		return res.status(404).json({ error: "consultation is not found" });

	if (consultation.resume)
		return res.status(200).json({ resume: consultation.resume });

	try {
		const consultationResume = await LLM.invoke([
			new SystemMessage(
				`You are an expert clinical AI assistant tasked with generating a concise consultation summary.

            [Context]
            - Input: A raw medical consultation record containing chronological clinical findings.
            - Language: The summary must be generated to match the target environment: ${LANGUAGE}.

            [Response Rules]
            - Formatting: Strictly < 120 words.
            - Layout: Exactly ONE continuous paragraph of fluid, narrative sentences.
            - Structure: Weave the sequential clinical data points into smooth prose:
                1. Sentence(s) linking the date, visit type, and primary reason/symptoms (including severity if noted).
                2. Sentence(s) integrating key vital signs and critical clinical observations from the notes.
                3. Concluding sentence(s) stating the confirmed diagnosis, prescribed treatment plan, and any scheduled follow-ups or requested tests.

            [Constraints]
            - Directness: Start the clinical narrative immediately. Completely omit conversational filler or introductory phrases (e.g., do NOT start with "Ce document résume...", "Voici le résumé...", or "Le patient...").
            - Factuality: Rely strictly on the provided text. Do not assume, extrapolate, or hallucinate clinical information.
            - Density: Use standard ${LANGUAGE} medical abbreviations where appropriate to maximize information density and honor the word limit (e.g., ttt, Cs, RDV, ATCD).`,
			),
			formatConsultation(consultation),
		]);

		consultation.resume = consultationResume.content;
		await consultation.save();

		return res.status(200).json({ resume: consultationResume.content });
	} catch (error) {
		console.error("[summarize] error:", error.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}

export default { summarize };
