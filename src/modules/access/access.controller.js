import Access from "./access.model.js";

// Doctor sends access request

export const requestAccess = async (req, res) => {
  try {
    const existing = await Access.findOne({
      doctor: req.user.id,
      patient: req.body.patientId,
    });

    if (existing) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const access = await Access.create({
      doctor: req.user.id,
      patient: req.body.patientId,
    });

    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient sees pending requests

export const getPatientRequests = async (req, res) => {
  try {
    const requests = await Access.find({
      patient: req.user.id,
      status: "pending",
    }).populate("doctor");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient approves or rejects

export const respondAccess = async (req, res) => {
  try {
    const access = await Access.findById(req.params.id);

    if (!access)
      return res.status(404).json({ message: "Access request not found" });

    // Making sure that the logged user is the patient
    if (access.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    access.status = req.body.status; // approved/rejected
    await access.save();

    res.json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor gets approved patients

export const getDoctorPatients = async (req, res) => {
  try {
    const accesses = await Access.find({
      doctor: req.user.id,
      status: "approved",
    }).populate("patient");

    res.json(accesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient gets approved doctors

export const getPatientDoctors = async (req, res) => {
  try {
    const accesses = await Access.find({
      patient: req.user.id,
      status: "approved",
    }).populate("doctor");

    res.json(accesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient removes doctor (delete access)

export const removeDoctor = async (req, res) => {
  try {
    const access = await Access.findById(req.params.id);

    if (!access) return res.status(404).json({ message: "Access not found" });

    if (access.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await access.deleteOne();

    res.json({ message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
