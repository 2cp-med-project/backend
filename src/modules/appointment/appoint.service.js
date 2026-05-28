import mongoose from "mongoose";
import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";


// Helper: Convert UTC to Algeria time
function toAlgeriaTime(date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Algiers' }));
}

// Helper: Create date with specific time in Algeria timezone
function createAlgeriaDateTime(dateStr, timeStr) {
  // Parse the date (YYYY-MM-DD)
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Parse the time (HH:MM)
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date in Algeria timezone
  const algeriaDate = new Date(Date.UTC(year, month - 1, day, hours - 1, minutes));
  // Algeria is GMT+1, so subtract 1 hour to get UTC
  
  return algeriaDate;
}

async function createAppointment(patientId, appointmentData) {
  const { type, date, time,doctername, appointmentnotes } = appointmentData;
  console.log("Creating appointment with ", doctername);
  // Format time (convert "14h55" to "14:55" if needed)
  let formattedTime = time;
  if (time && time.includes('h')) {
    formattedTime = time.replace('h', ':');
  }
  
  const allowedTypes = ["IRM-RADIO-SCANNER", "IRM", "RADIO", "SCANNER", "ANALYSE", "CONSULTATION"];
  if (!allowedTypes.includes(type)) throw new Error("Invalid appointment type");
  
  // Create appointment date in Algeria timezone
  const appointmentAlgeriaDate = createAlgeriaDateTime(date, formattedTime);
  const appointmentUTC = new Date(appointmentAlgeriaDate.getTime());
  
  console.log("📅 Appointment - Algeria time:", appointmentAlgeriaDate);
  console.log("📅 Appointment - UTC:", appointmentUTC);
  
  const reminders = [];
  
  // Helper to add reminder in Algeria timezone
  function addReminder(daysBefore) {
    const reminderAlgeriaDate = new Date(appointmentAlgeriaDate);
    reminderAlgeriaDate.setDate(reminderAlgeriaDate.getDate() - daysBefore);
    // Keep the same time (e.g., 15:00 Algeria time)
    
    reminders.push({
      date: reminderAlgeriaDate,
      sent: false
    });
  }
  
  // Add reminders based on appointment type
  if (["IRM-RADIO-SCANNER", "IRM", "RADIO", "SCANNER"].includes(type)) {
    addReminder(30);  // 30 days before
  }
  
  if (type === "ANALYSE") {
    addReminder(15);  // 15 days before
  }
  
  if (type === "CONSULTATION") {
    addReminder(7);   // 7 days before
  }
  
  // Always add 1 day before reminder
  addReminder(1);
  
  const appointment = {
    _id: new mongoose.Types.ObjectId(),
    type,
    date: appointmentUTC,
    time: formattedTime,
    status: "scheduled",
    doctername: doctername || "",
    appointmentnotes: appointmentnotes || "",
    reminders,
  };
  
  console.log("✅ Appointment created with reminders in Algeria time");
  console.log("Reminders:", reminders.map(r => ({ date: r.date, sent: r.sent })));
  
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");
  
  patient.appointments.push(appointment);
  await patient.save();
  
  return appointment;
}


async function getAppointments(patientId) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let statusChanged = false;
  
  for (const appointment of patient.appointments) {
    const appointmentDate = new Date(appointment.date);
    const appointmentDay = new Date(
      appointmentDate.getFullYear(), 
      appointmentDate.getMonth(), 
      appointmentDate.getDate()
    );
    
    if (appointmentDay < today && appointment.status === "scheduled") {
      appointment.status = "done";
      statusChanged = true;
    }
  }
  
  if (statusChanged) {
    await patient.save();
  }
  
  return patient.appointments;
}

export default {
  createAppointment,
  getAppointments,
};