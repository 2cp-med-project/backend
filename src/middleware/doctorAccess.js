import Access from "../modules/access/access.model.js";

async function doctorAccess(req, res, next) {
  const doctorId = req.user.id;
  const patientId = req.params.patientId;

  try {
    const access = await Access.findOne({
      doctor: doctorId,
      patient: patientId,
      status: "active",
    });

    if (!access) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default doctorAccess;
