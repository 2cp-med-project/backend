import Patient from "../users/patient.model.js"; 
import admin from "firebase-admin";
import Doctor from "../users/doctor.model.js";
import { io, onlineUsers } from "./channels/socket.js";
 async function saveFcmToken(userId, fcmToken) {
  
const result = await Patient.updateOne(
  { _id: userId },
  { $set: { fcmToken } }
);

console.log(result);
}
 // Notify patient when doctor requests access to their medical record                                                                                                                                                            
async function sendAccessRequestNotification(doctorId, patientId) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");

  const patient = await Patient.findById(patientId);
  if (!patient || !patient.fcmToken) {
    throw new Error("Patient or FCM token not found");
  }

  await admin.messaging().send({
    token: patient.fcmToken,
    notification: {
      title: "Access Request",
      body: `Dr. ${doctor.firstName} ${doctor.lastName} veut accéder à votre dossier médical`,
    },
    data: {
      doctorId: doctorId.toString(),
      type: "ACCESS_REQUEST",
    },
  });
}


// Notify doctor when patient responds
 async function sendPatientResponseNotification(patientId, doctorId, accepted) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

 const statusText = accepted ? "accepté" : "refusé";
  const message = {
    title: "Patient Response",
    body:`Le patient ${patient.firstName} ${patient.lastName} a ${statusText} votre demande`,
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

  const patients = await Patient.find({
    "appointments.reminders.sent": false,
  });

  if (!patients.length) {
    return { message: "No reminders to send." };
  }

  for (const patient of patients) {
    let updated = false;

    for (const appointment of patient.appointments || []) {

      

      const appointmentTime = new Date(appointment.date).getTime();

      let actionText = "";

      switch (appointment.type) {
        case "IRM":
          actionText = "votre IRM";
          break;
        case "RADIO":
          actionText = "votre radiographie";
          break;
        case "SCANNER":
          actionText = "votre scanner";
          break;
        case "ANALYSE":
          actionText = "votre analyse médicale";
          break;
        case "CONSULTATION":
          actionText = "votre consultation";
          break;
        default:
          actionText = "votre rendez-vous médical";
      }

      for (const reminder of appointment.reminders || []) {

        if (reminder.sent) continue;

        const reminderTime = new Date(reminder.date).getTime();

        if (reminderTime <= now.getTime()) {

          const diffHours =
            (appointmentTime - now.getTime()) / (1000 * 60 * 60);

          let message = "";

          if (diffHours > 24) {
            const diffDays = Math.ceil(diffHours / 24);

            message = `Vous avez ${actionText} avec Dr ${appointment.doctername} dans ${diffDays} jours à ${appointment.time}.`;
          } else {
            const when =
              diffHours > 0 ? "demain" : "aujourd'hui";

            message = `Rappel : vous avez ${actionText} ${when} à ${appointment.time} avec Dr ${appointment.doctername}.`;
          }

          if (patient.fcmToken) {
            await admin.messaging().send({
              token: patient.fcmToken,
              notification: {
                title: "Rappel de rendez-vous",
                body: message,
              },
              data: {
                type: "APPOINTMENT_REMINDER",
                appointmentId: appointment._id?.toString() || "",
              },
            });
          }

          reminder.sent = true;
          updated = true;
        }
      }
    }

    if (updated) {
      await patient.save();
    }
  }

  return { message: "Reminders processed successfully" };
}

export default {saveFcmToken,sendPatientResponseNotification,sendAppointmentReminders};