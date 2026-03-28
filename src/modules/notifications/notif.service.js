import Patient from "../users/patient.model.js"; 
import admin from "firebase-admin";
import Doctor from "../users/doctor.model.js";
import { io, onlineUsers } from "./channels/socket.js";
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


// Sends appointment reminders via FCM
async function sendAppointmentReminders() {
  const now = new Date();

  // Only get patients who have reminders that are not sent and are due
  const patients = await Patient.find({
    "appointments.reminders.sent": false,
    "appointments.reminders.date": { $lte: now },
  });
  if (!patients || patients.length === 0) {
    console.log("No reminders to send.");
    return { message: "No reminders to send." };
  }

  for (const patient of patients) {

    for (const appointment of patient.appointments) {
      const doctor = await Doctor.findById(appointment.doctorId);

      if (!doctor) continue;

      for (const reminder of appointment.reminders) {
        if (!reminder.sent && reminder.date <= now) {
          const diffTime = appointment.date.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let message = "";

          if (diffDays > 1) {
            message = `Vous avez un rendez-vous avec Dr ${doctor.name} dans ${diffDays} jours à ${appointment.time}.`;
          } else {
            message = `Rappel : Vous avez un ${appointment.type} demain à ${appointment.time} avec Dr ${doctor.name} à ${appointment.Location}.`;
          }

          // Send notification via FCM
          if (patient.fcmToken) {
            await admin.messaging().send({
              token: patient.fcmToken,
              notification: {
                title: "Rappel de rendez-vous",
                body: message,
              },
            });
          }

          // Mark the reminder as sent
          reminder.sent = true;
        }
        else {
      }
    }

    // Save patient with updated reminders
    await patient.save();
  }

  return { message: "Notifications envoyées" };
}}



export default {saveFcmToken,sendAccessRequestNotification,sendPatientResponseNotification,sendAppointmentReminders};