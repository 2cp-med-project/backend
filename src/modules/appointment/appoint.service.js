import mongoose from "mongoose";
import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";

async function createAppointment(patientId, appointmentData) {
  const { type,date,time, location, appointmentnotes } = appointmentData;

  if (!time) throw new Error("Appointment time is required");

  const allowedTypes = ["IRM", "RADIO", "SCANNER", "ANALYSE", "CONSULTATION"];
  if (!allowedTypes.includes(type)) throw new Error("Invalid appointment type");

  
  const appointmentDate = new Date(date);

  const reminders = [];

  //  IRM / RADIO / SCANNER → 30 days before
  if (["IRM", "RADIO", "SCANNER"].includes(type)) {
    reminders.push({
      date: new Date(appointmentDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    });
  }

  //  ANALYSE → 15 days before
  if (type === "ANALYSE") {
    reminders.push({
      date: new Date(appointmentDate.getTime() - 15 * 24 * 60 * 60 * 1000),
    });
  }

  //  CONSULTATION → 7 days before
  if (type === "CONSULTATION") {
    reminders.push({
      date: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
    });
  }

  // always 1 day before
  reminders.push({
    date: new Date(appointmentDate.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  const appointment = {
    _id: new mongoose.Types.ObjectId(),
    type, 
   
    date: appointmentDate,
    time,
    status: "scheduled",
    location: location || "",
    appointmentnotes: appointmentnotes || "",
    reminders,
  };
  console.log(appointment);
console.log("patientId:", patientId);
 const patient = await Patient.findById(patientId);
 if (!patient) throw new Error("Patient not found");

patient.appointments.push(appointment);
await patient.save();
  return  appointment ;
}

 

async function getAppointments(patientId) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");
  return patient.appointments;
}



export default {
  createAppointment,
  getAppointments,
  
};