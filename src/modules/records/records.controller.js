import { Consultation } from "./consultation.model.js";
import { Doctor } from "../users/doctor.model.js";
import { Report } from "./report.model.js";
import { Patient } from "../users/patient.model.js";

export async function createConsultation(req, res) {
	const { patientId, doctorId, report } = req.body;

	const [patient, doctor] = await Promise.all([
		Patient.findById(patientId).lean(),
		Doctor.findById(doctorId).lean(),
	]);

	if (!patient)
		return res.status(404).json({ message: "Patient not found." });
	if (!doctor) return res.status(404).json({ message: "Doctor not found." });

	let newReport, newConsultation;
	try {
		newReport = await Report.create(report);
		newConsultation = await Consultation.create({
			doctorId,
			reportId: newReport.id,
		});
		await Patient.findByIdAndUpdate(patientId, {
			$push: { medicalConsultations: newConsultation.id },
		});
	} catch (error) {
		console.error("Error creating consultation:", error);

		await Promise.allSettled([
			newConsultation &&
				Consultation.findByIdAndDelete(newConsultation.id),
			newReport && Report.findByIdAndDelete(newReport.id),
		]);

		return res.status(500).json({ message: "Internal Server Error" });
	}

	return res.status(201).json({
		success: true,
		patientId,
		doctorId,
		consultationId: newConsultation.id.toString(),
	});
}
