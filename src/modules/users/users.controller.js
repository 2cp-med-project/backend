import Doctor from "./doctor.model.js";
import Patient from "./patient.model.js";

async function getPatients(req, res) {
  const {
    page = "0",
    limit = "10",
    order = "asc",
    sortBy = "firstName",
  } = req.query || {};

  const allowedSortFields = [
    "firstName",
    "lastName",
    "email",
    "createdAt",
    "dateOfBirth",
    "placeOfBirth",
  ];

  const returnedFields = {
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    dateOfBirth: 1,
    placeOfBirth: 1,
    gender: 1,
  }; //TODO: add the record field after merging with the record module.

  try {
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sortBy field" });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ message: "Invalid order value" });
    }

    const p = parseInt(page);
    const l = parseInt(limit);
    const o = order === "asc" ? 1 : -1;

    if (isNaN(p) || isNaN(l) || p < 0 || l <= 0) {
      return res.status(400).json({ message: "Invalid page or limit value" });
    }

    const patients = await Patient.find({}, returnedFields)
      .sort({ [sortBy]: o })
      .skip(p * l)
      .limit(l);

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getDoctors(req, res) {
  const {
    page = "0",
    limit = "10",
    order = "asc",
    sortBy = "name",
  } = req.query || {};

  const allowedSortFields = [
    "firstName",
    "lastName",
    "email",
    "createdAt",
    "specialization",
    "licenseNumber",
  ];

  const returnedFields = {
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    specialization: 1,
    licenseNumber: 1,
    createdAt: 1,
  };

  try {
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sortBy field" });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ message: "Invalid order value" });
    }

    const p = parseInt(page);
    const l = parseInt(limit);
    const o = order === "asc" ? 1 : -1;

    if (isNaN(p) || isNaN(l) || p < 0 || l <= 0) {
      return res.status(400).json({ message: "Invalid page or limit value" });
    }

    const doctors = await Doctor.find({}, returnedFields)
      .sort({ [sortBy]: o })
      .skip(p * l)
      .limit(l);

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getPatientById(req, res) {
  const { id } = req.params || {};
  const returnedFields = {
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    dateOfBirth: 1,
    placeOfBirth: 1,
    gender: 1,
  }; //TODO: add the record field after merging with the record module.

  try {
    if (!id) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await Patient.findById(id, returnedFields);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch {
    res.status(500).json({ message: error.message });
  }
}

async function getDoctorById(req, res) {
  const { id } = req.params || {};
  const returnedFields = {
    firstName: 1,
    lastName: 1,
    email: 1,
    phone: 1,
    specialization: 1,
    licenseNumber: 1,
    createdAt: 1,
  };

  try {
    if (!id) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const doctor = await Doctor.findById(id, returnedFields);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch {
    res.status(500).json({ message: error.message });
  }
}

export { getPatients, getDoctors, getPatientById, getDoctorById };
