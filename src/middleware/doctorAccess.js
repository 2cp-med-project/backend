import Access from "../modules/access/access.model.js";

async function doctorAccess(req, res, next) {
  const { id, role } = req.user;

  try {
    if (role !== "doctor") {
      next();
      return;
    }

    const access = await Access.find(
      { doctor: id, status: "active" },
      { patient: 1 },
    ).lean();

    if (!access) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    req.user.patients = access.map((a) => a.patient.toString()); // add the patients that the doctor have access to to req.user for later use in controllers

    next();
    return;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default doctorAccess;
