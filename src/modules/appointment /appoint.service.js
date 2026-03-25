import mongoose from "mongoose";
import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";

async function createAppointment(patientId, appointmentData) {
  const { type, doctorName, date, time, location, appointmentnotes } = appointmentData;

  if (!time) throw new Error("Appointment time is required");

  const allowedTypes = ["IRM", "RADIO", "SCANNER", "ANALYSE", "CONSULTATION"];
  if (!allowedTypes.includes(type)) throw new Error("Invalid appointment type");

  const doctor = await Doctor.findOne({ name: doctorName });
  if (!doctor) throw new Error("Doctor not found");

  const doctorId = doctor._id;
  const appointmentDate = new Date(date);

  const reminders = [];
  if (["IRM", "RADIO", "SCANNER"].includes(type)) {
    reminders.push({ date: new Date(appointmentDate.getTime() - 30 * 24 * 60 * 60 * 1000) });
  }
  if (type === "ANALYSE") {
    reminders.push({ date: new Date(appointmentDate.getTime() - 15 * 24 * 60 * 60 * 1000) });
  }
  if (type === "CONSULTATION") {
    reminders.push({ date: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000) });
  }
  reminders.push({ date: new Date(appointmentDate.getTime() - 1 * 24 * 60 * 60 * 1000) });

  const appointment = {
    _id: new mongoose.Types.ObjectId(),
    type,
    doctorId,
    date: appointmentDate,
    time,
    status: "scheduled",
    location: location || "",
    appointmentnotes: appointmentnotes || "",
    reminders
  };

  await Patient.updateOne(
    { _id: patientId },
    { $push: { appointments: appointment } }
  );

  return appointment;
}

async function getPatientAppointments(patientId) {
  const patient = await Patient.findById(patientId).populate("appointments.doctorId", "name");
  if (!patient) throw new Error("Patient not found");
  return patient.appointments;
}

async function updateAppointment(patientId, appointmentId, updateData) {
  const updateFields = { ...updateData };

  const patient = await Patient.findOne({ _id: patientId, "appointments._id": appointmentId });
  if (!patient) throw new Error("Appointment not found");

  const appointment = patient.appointments.find(a => a._id.toString() === appointmentId);
  const appointmentDate = updateData.date ? new Date(updateData.date) : appointment.date;
  const type = updateData.type || appointment.type;

  const allowedTypes = ["IRM", "RADIO", "SCANNER", "ANALYSE", "CONSULTATION"];
  if (!allowedTypes.includes(type)) throw new Error("Invalid appointment type");

  if (updateData.date || updateData.type) {
    const reminders = [];
    if (["IRM", "RADIO", "SCANNER"].includes(type)) {
      reminders.push({ date: new Date(appointmentDate.getTime() - 30 * 24 * 60 * 60 * 1000) });
    }
    if (type === "ANALYSE") {
      reminders.push({ date: new Date(appointmentDate.getTime() - 15 * 24 * 60 * 60 * 1000) });
    }
    if (type === "CONSULTATION") {
      reminders.push({ date: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000) });
    }
    reminders.push({ date: new Date(appointmentDate.getTime() - 1 * 24 * 60 * 60 * 1000) });
    updateFields.reminders = reminders;
  }

  if (updateData.time) {
    updateFields.time = updateData.time;
  }

  await Patient.updateOne(
    { _id: patientId, "appointments._id": appointmentId },
    { $set: Object.fromEntries(Object.entries(updateFields).map(([k,v]) => [`appointments.$.${k}`, v])) }
  );

  return await Patient.findOne(
    { _id: patientId, "appointments._id": appointmentId },
    { "appointments.$": 1 }
  );
}

async function deleteAppointment(patientId, appointmentId) {
  await Patient.updateOne(
    { _id: patientId },
    { $pull: { appointments: { _id: appointmentId } } }
  );
  return { message: "Appointment deleted" };
}

export default {
  createAppointment,
  getPatientAppointments,
  updateAppointment,
  deleteAppointment
};