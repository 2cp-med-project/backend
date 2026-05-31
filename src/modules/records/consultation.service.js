function formatConsultation(c) {
	const lines = [
		`Date: ${new Date(c.date).toLocaleDateString("en-GB", { dateStyle: "long" })}`,
		`Status: ${c.status}`,
	];

	if (c.followUpDate) {
		lines.push(
			`Follow-up: ${new Date(c.followUpDate).toLocaleDateString("en-GB", { dateStyle: "long" })}`,
		);
	}

	// Access fields directly from the Consultation model
	if (c.typeofvisit) lines.push(`Visit type: ${c.typeofvisit}`);
	if (c.motive) lines.push(`Reason: ${c.motive}`);
	if (c.symptoms)
		lines.push(
			`Symptoms: ${c.symptoms}${c.severity ? ` (${c.severity})` : ""}`,
		);
	if (c.systemReview) lines.push(`System review: ${c.systemReview}`);

	const vitals = [
		c.bloodPressure && `BP: ${c.bloodPressure}`,
		c.heartRate && `HR: ${c.heartRate}`,
		c.respiratoryRate && `RR: ${c.respiratoryRate}`,
		c.temperature && `Temp: ${c.temperature}`,
		c.weight && `Weight: ${c.weight}`,
	].filter(Boolean);

	if (vitals.length > 0) lines.push(`Vitals: ${vitals.join(" | ")}`);

	if (c.diagnosis) lines.push(`Diagnosis: ${c.diagnosis}`);
	if (c.notes) lines.push(`Notes: ${c.notes}`);
	if (c.treatmentPlan) lines.push(`Treatment: ${c.treatmentPlan}`);
	if (c.additionalTests) lines.push(`Tests: ${c.additionalTests}`);

	return lines.join("\n");
}

export default formatConsultation;
