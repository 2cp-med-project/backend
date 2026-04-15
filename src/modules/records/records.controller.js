import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";
import Consultation from "./consultation.model.js";

async function createConsultation(req, res) {
  // #swagger.tags = ['Consultations']
  // #swagger.security = [{ bearerAuth: [] }]
  // #swagger.summary = 'Create a new consultation record'
  // #swagger.description = 'Roles: doctor. only doctors who have access to the patient can create consultations for that patient'

  const { id, patients } = req.user || {};

  const {
    doctorId,
    patientId,
    date,
    status,
    typeofvisit,
    motive,
    symptoms,
    severity,
    followUpDate,
    diagnosis,
    treatmentPlan,
    notes,
    bloodPressure,
    heartRate,
    respiratoryRate,
    temperature,
    weight,
    systemReview,
    additionalTests,
  } = req.body || {};

  if (!doctorId || !patientId || !date) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  if (doctorId !== id) {
    res.status(403).json({
      message: "Unauthorized: Doctor ID does not match authenticated user",
    });
    return;
  }

  if (!patients.includes(patientId)) {
    res.status(403).json({
      message: "Unauthorized: Doctor does not have access to this patient",
    });
    return;
  }

  try {
    const doctor = await Doctor.findById(doctorId, { _id: 1 });
    const patient = await Patient.findById(patientId, { _id: 1 });

    if (!doctor) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const consultation = new Consultation({
      doctorId,
      patientId,
      date,
      status,
      typeofvisit,
      motive,
      symptoms,
      severity,
      followUpDate,
      diagnosis,
      treatmentPlan,
      notes,
      bloodPressure,
      heartRate,
      respiratoryRate,
      temperature,
      weight,
      systemReview,
      additionalTests,
    });
    await consultation.save();
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteConsultation(req, res) {
  // #swagger.tags = ['Consultations']
  // #swagger.security = [{ bearerAuth: [] }]
  // #swagger.summary = 'Delete a consultation record'
  // #swagger.description = 'Roles: doctor. Only the doctor who created the consultation and have access to the patient can delete it'

  const { consultationId } = req.params;
  const { id, patients } = req.user || {};

  try {
    if (!consultationId) {
      res.status(400).json({ message: "Consultation ID is required" });
      return;
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      res.status(404).json({ message: "Consultation not found" });
      return;
    }

    if (!patients.includes(consultation.patientId.toString())) {
      res.status(403).json({
        message: "Unauthorized: Doctor does not have access to this patient",
      });
      return;
    }

    if (consultation.doctorId.toString() !== id) {
      res.status(403).json({
        message:
          "Unauthorized: Only the doctor who created the consultation can delete it",
      });
      return;
    }

    await Consultation.findByIdAndDelete(consultationId);

    res.status(200).json({ message: "Consultation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getConsultationById(req, res) {
  // #swagger.tags = ['Consultations']
  // #swagger.security = [{ bearerAuth: [] }]
  // #swagger.summary = 'Get a consultation by ID'
  // #swagger.description = 'Roles: doctor, patient. Doctors can only access consultations of patients they have access to. Patients can only access their own consultations'

  const { consultationId } = req.params || {};
  const { id, role, patients } = req.user || {};

  try {
    if (!consultationId) {
      res.status(400).json({ message: "Consultation ID is required" });
      return;
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      res.status(404).json({ message: "Consultation not found" });
      return;
    }

    if (
      role === "doctor" &&
      !patients.includes(consultation.patientId.toString())
    ) {
      res.status(403).json({
        message: "Unauthorized: Doctor does not have access to this patient",
      });
      return;
    }

    if (role === "patient" && consultation.patientId.toString() !== id) {
      res.status(403).json({
        message:
          "Unauthorized: Patients can only access their own consultations",
      });
      return;
    }

    res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getConsultations(req, res) {
  // #swagger.tags = ['Consultations']
  // #swagger.security = [{ bearerAuth: [] }]
  // #swagger.summary = 'Get consultations for a patient with pagination and sorting'
  // #swagger.description = 'Roles: doctor, patient.'
  // #swagger.parameters['page'] = { description: 'Page number (starting from 0)', type: 'integer', default: 0 }
  // #swagger.parameters['limit'] = { description: 'Number of items per page', type: 'integer', default: 10 }
  // #swagger.parameters['order'] = { description: 'Sort order (asc or desc)', type: 'string', default: 'asc' }
  // #swagger.parameters['sortBy'] = { description: 'Field to sort by', type: 'string', default: 'firstName' }

  const { patientId } = req.params || {};
  const { id, role, patients } = req.user || {};
  const {
    page = "0",
    limit = "10",
    sortBy = "date",
    order = "desc",
  } = req.query || {};

  try {
    if (!patientId) {
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }

    if (role === "doctor" && !patients.includes(patientId)) {
      res.status(403).json({
        message: "Unauthorized: Doctor does not have access to this patient",
      });
      return;
    }

    if (role === "patient" && patientId !== id) {
      res.status(403).json({
        message:
          "Unauthorized: Patients can only access their own consultations",
      });
      return;
    }

    if (!Consultation.schema.path(sortBy)) {
      res.status(400).json({ message: "Invalid sort field" });
      return;
    }

    if (!["asc", "desc"].includes(order)) {
      res.status(400).json({ message: "Invalid sort order" });
      return;
    }

    const p = parseInt(page);
    const l = parseInt(limit);
    const o = order === "asc" ? 1 : -1;

    if (isNaN(p) || isNaN(l) || p < 0 || l <= 0) {
      return res.status(400).json({ message: "Invalid page or limit value" });
    }

    const consultations = await Consultation.find({ patientId: patientId })
      .sort({ [sortBy]: o })
      .skip(p * l)
      .limit(l);
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateConsultation(req, res) {
  // #swagger.tags = ['Consultations']
  // #swagger.security = [{ bearerAuth: [] }]
  // #swagger.summary = 'Update a consultation record'
  // #swagger.description = 'Roles: doctor. Only the doctor who created the consultation and have access to the patient can update it. Only specific fields can be updated'

  const newData = req.body || {};
  const { consultationId } = req.params || {};
  const { id, patients } = req.user || {};

  const allowedFields = [
    "date",
    "status",
    "typeofvisit",
    "motive",
    "symptoms",
    "severity",
    "followUpDate",
    "diagnosis",
    "treatmentPlan",
    "notes",
    "bloodPressure",
    "heartRate",
    "respiratoryRate",
    "temperature",
    "weight",
    "systemReview",
    "additionalTests",
  ];

  try {
    if (!consultationId) {
      res.status(400).json({ message: "Consultation ID is required" });
      return;
    }

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      res.status(404).json({ message: "Consultation not found" });
      return;
    }

    if (!patients.includes(consultation.patientId.toString())) {
      res.status(403).json({
        message: "Unauthorized: Doctor does not have access to this patient",
      });
      return;
    }

    if (consultation.doctorId.toString() !== id) {
      res.status(403).json({
        message:
          "Unauthorized: Only the doctor who created the consultation can update it",
      });
      return;
    }

    let updateData = {};
    for (const key in newData) {
      if (allowedFields.includes(key) && newData[key] !== undefined) {
        updateData[key] = newData[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    consultation.set(updateData);
    const updatedConsultation = await consultation.save();

    res.status(200).json(updatedConsultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default {
  createConsultation,
  deleteConsultation,
  getConsultationById,
  getConsultations,
  updateConsultation,
};
