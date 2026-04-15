//receive rdv notifications ,access request notifications

import service from "./notif.service.js";
 async function registerFcmToken(req, res) {
  try {
    const { userId, fcmToken } = req.body;
    await saveFcmToken(userId, fcmToken);
    res.status(200).json({ message: "FCM token saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} async function requestAccess(req, res) {
  try {
    const { doctorId, patientId } = req.body;

    await sendAccessRequestNotification(doctorId, patientId);

    res.status(200).json({
      message: "Access request notification sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }}
export default { registerFcmToken,requestAccess };