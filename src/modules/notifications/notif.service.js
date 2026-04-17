import Patient from "../users/patient.model.js";
import admin from "firebase-admin";

async function saveFcmToken(userId, fcmToken) {
  const result = await Patient.updateOne(
    { _id: userId },
    { $set: { fcmToken } },
  );
  if (result.matchedCount === 0) {
    throw new Error("User not found");
  }
}

async function send(message, token) {
  const payload = {
    ...message,
    token,
  };
  await admin.messaging().send(payload);
}

export default { saveFcmToken, send };
