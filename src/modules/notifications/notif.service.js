import Patient from "../users/patient.model.js";
import admin from "firebase-admin";
import Doctor from "../users/doctor.model.js";

async function saveFcmToken(userId, fcmToken) {
	await Patient.updateOne({ _id: userId }, { $set: { fcmToken } });
}

async function sendAccessRequestNotification(doctorId, patientId) {
	const doctor = await Doctor.findById(doctorId);
	if (!doctor) {
		throw new Error("Doctor not found");
	}

	const patient = await Patient.findById(patientId);
	if (!patient || !patient.fcmToken) {
		throw new Error("Patient or FCM token not found");
	}

	const message = {
		notification: {
			title: "Access Request",
			body: `Dr. ${doctor.firstName} ${doctor.lastName} wants to access your medical file`,
		},
		data: {
			doctorId: doctorId.toString(),
			type: "ACCESS_REQUEST",
		},
		token: patient.fcmToken,
	};

	await admin.messaging().send(message);
}

export default { saveFcmToken, sendAccessRequestNotification };
