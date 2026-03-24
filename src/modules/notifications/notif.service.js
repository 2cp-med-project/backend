import Patient from "../users/patient.model.js"; 
import admin from "firebase-admin";
import Doctor from "../users/doctor.model.js";
import { io, onlineUsers } from "../../channels/socket.js";
 async function saveFcmToken(userId, fcmToken) {
  await Patient.updateOne(
    { _id: userId },
    { $set: { fcmToken } }
  );
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
      body: `Dr. ${doctor.firstName} ${doctor.lastName} wants to access your medical file`
    },
    data: {
      doctorId: doctorId.toString(),
      type: "ACCESS_REQUEST"
    },
    token: patient.fcmToken
  };


  await admin.messaging().send(message);
}


// Notify doctor when patient responds
 async function sendPatientResponseNotification(patientId, doctorId, accepted) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const statusText = accepted ? "accepted" : "denied";

  const message = {
    title: "Patient Response",
    body: `Patient ${patient.firstName} ${patient.lastName} has ${statusText} your request`,
    patientId,
    status: statusText
  };

  const socketId = onlineUsers[doctorId];

  if (socketId) {
    io.to(socketId).emit("patient-response", message);
  } else {
    console.log("Doctor is offline, cannot send real-time notification");
  }
}

export default {saveFcmToken,sendAccessRequestNotification,sendPatientResponseNotification};