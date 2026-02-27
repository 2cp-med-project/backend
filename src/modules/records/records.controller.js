//Handles Medical file, reports,Consultations



//Get medical file (only if doctor has access)
const access = await Access.findOne({
  doctor: req.user.id,
  patient: req.params.patientId,
  status: "approved",
});

if (!access) {
  return res.status(403).json({ message: "Access denied" });
}
