import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";
import Consultation from "./consultation.model.js";

async function createConsultation(req, res) {
  const {
    doctorId,
    patientId,
    date,
    status,
    typeofvisits,
    motive,
    synptoms,
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

  try {
    const consultation = new Consultation({
      doctor: doctorId,
      patient: patientId,
      date: date,
      status: status,
      typeofvisits: typeofvisits,
      motive: motive,
      synptoms: synptoms,
      severity: severity,
      followUpDate: followUpDate,
      diagnosis: diagnosis,
      treatmentPlan: treatmentPlan,
      notes: notes,
      bloodPressure: bloodPressure,
      heartRate: heartRate,
      respiratoryRate: respiratoryRate,
      temperature: temperature,
      weight: weight,
      systemReview: systemReview,
      additionalTests: additionalTests,
    });
    await consultation.save();
    res.status(201).json(consultation.id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteConsultation(req, res) {
  const { id } = req.params;
  try {
    const consultation = await Consultation.findByIdAndDelete(id);
    if (!consultation) {
      res.status(404).json({ message: "Consultation not found" });
      return;
    }
    res.status(200).json({ message: "Consultation deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getConsultationById(req, res) {
  const { id } = req.params || {};
  try {
    if (!id) {
      res.status(400).json({ message: "Consultation ID is required" });
      return;
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      res.status(404).json({ message: "Consultation not found" });
      return;
    }
    res.status(200).json(consultation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getConsultations(req, res) {
  const { patientId } = req.params || {};
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

    const consultations = await Consultation.find({ patient: patientId })
      .sort({ [sortBy]: o })
      .skip(p * l)
      .limit(l);
    res.status(200).json(consultations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateConsultation(req, res) {
  const { id } = req.params || {};
  const updateData = req.body;

  try {
    if (!id) {
      res.status(400).json({ message: "Consultation ID is required" });
      return;
    }
    const consultation = await Consultation.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!consultation) {
      res.status(404).json({ message: "Consultation not found" });
      return;
    }
    res.status(200).json(consultation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export default {
  createConsultation,
  deleteConsultation,
  getConsultationById,
  getConsultations,
  updateConsultation,
};
