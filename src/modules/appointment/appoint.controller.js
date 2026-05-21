import Service from "./appoint.service.js";

// Add an appointment
export async function addAppointment(req, res) {
  //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user.id; 
    const { type,  date,time, location, appointmentnotes} = req.body;

    let appointment = await Service.createAppointment(patientId, {
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



// List all appointments 
export async function getMyAppointments(req, res) {
   //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user.id;

    const appointments = await Service.getAppointments(patientId);

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export default {
  addAppointment,
 
  getMyAppointments,
};