//receive rdv notifications ,access request notifications

import service from "./notif.service.js";

async function registerFcmToken(req, res) {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;
    await service.saveFcmToken(userId, fcmToken);
    res.status(200).json({ message: "FCM token saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default { registerFcmToken };
