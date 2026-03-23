import Access from "./access.model.js";

//Doctor sends access request

async function requestAccess(req, res) {
  const { patientId } = req.body;
  const doctorId = req.user.id;

  try {
    if (!patientId) {
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }

    const payload = {
      doctor: doctorId,
      patient: req.body.patientId,
    };
    const existing = await Access.findOne(payload);

    if (existing) {
      res.status(400).json({ message: "A request is already sent" });
      return;
    }

    const access = await Access.create(payload);

    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient sees pending requests

async function getPatientRequests(req, res) {
  const patientId = req.user.id;

  try {
    const requests = await Access.find({
      patient: patientId,
      status: { $in: ["pending", "active"] },
    }).populate("id doctor timestamp");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient approves or rejects

async function respondAccess(req, res) {
  const { accepted } = req.body;
  const accessId = req.params.id;
  const patientId = req.user.id;

  try {
    if (typeof accepted !== "boolean") {
      return res.status(400).json({ message: "Accepted must be a boolean" });
    }

    const access = await Access.findById(accessId);

    if (!access)
      return res.status(404).json({ message: "Access request not found" });

    // Making sure that the logged user is the patient
    if (access.patient.toString() !== patientId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const status = accepted ? "active" : "rejected";

    access.status = status;
    await access.save();

    res.json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Doctor gets approved patients

async function getDoctorPatients(req, res) {
  const doctorId = req.user.id;
  try {
    const accesses = await Access.find({
      doctor: doctorId,
      status: "approved",
    }).populate("id patient timestamp ");

    res.json(accesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient gets approved doctors

async function getPatientDoctors(req, res) {
  const patientId = req.user.id;

  try {
    const accesses = await Access.find({
      patient: patientId,
      status: "active",
    }).populate("id doctor timestamp");

    res.json(accesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient removes doctor (delete access)

async function removeDoctor(req, res) {
  const patientId = req.user.id;
  const accessId = req.params.id;
  try {
    const access = await Access.findById(accessId);

    if (!access) {
      res.status(404).json({ message: "Access not found" });
      return;
    }

    if (access.patient.toString() !== patientId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await access.deleteOne();

    res.json({ message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default {
  requestAccess,
  getPatientRequests,
  respondAccess,
  getDoctorPatients,
  getPatientDoctors,
  removeDoctor,
};
