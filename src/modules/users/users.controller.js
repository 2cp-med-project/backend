async function getPatients(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get all patients'
  // #swagger.description = 'Roles: doctor'

  res.status(502).json({ message: "Not Implemented" });
}

async function getDoctors(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get all doctors'
  // #swagger.description = 'Roles: patient'

  res.status(502).json({ message: "Not Implemented" });
}

export default { getPatients, getDoctors };
