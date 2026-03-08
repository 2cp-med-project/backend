import Doctor from "./doctor.model.js";
import Patient from "./patient.model.js";

async function getPatients(req, res) {
  const {
    page = "0",
    limit = "10",
    order = "asc",
    sortBy = "name",
  } = req.query || {};

  try {
    if (!Patient.schema.path(sortBy) || sortBy === "password") {
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

    const patients = await Patient.find({}, { password: 0 })
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

  try {
    if (!Doctor.schema.path(sortBy) || sortBy === "password") {
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

    const doctors = await Doctor.find({}, { password: 0 })
      .sort({ [sortBy]: o })
      .skip(p * l)
      .limit(l);

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { getPatients, getDoctors };
