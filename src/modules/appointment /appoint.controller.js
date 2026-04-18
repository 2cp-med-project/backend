import Service from "./appoints.service.js";

// Add an appointment
export async function addAppointment(req, res) {
  //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user._id; 
    const { type,  date,time, location, appointmentnotes} = req.body;

    const appointment = await Service.createAppointment(patientId, {
      type,
     
      date,
      time,
       location, appointmentnotes,
    });

    res.status(201).json({ message: "Appointment added", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Modify an appointment 
export async function updateAppointment(req, res) {
   //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user._id;
    const appointmentId = req.params.id;
    const updates = req.body;

    const appointment = await Service.updateAppointment(
      patientId,
      appointmentId,
      updates
    );

    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete an appointment
export async function deleteAppointment(req, res) {
   //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user._id;
    const appointmentId = req.params.id;

    await Service.deleteAppointment(patientId, appointmentId);

    res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// List all appointments 
export async function getMyAppointments(req, res) {
   //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user._id;

    const appointments = await appointService.getAppointments(patientId);

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export default {
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getMyAppointments,
};