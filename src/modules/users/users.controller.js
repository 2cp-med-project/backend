async function getPatients(req, res) {
  res.status(502).json({ message: "Not Implemented" });
}

async function getDoctors(req, res) {
  res.status(502).json({ message: "Not Implemented" });
}

export default { getPatients, getDoctors };
