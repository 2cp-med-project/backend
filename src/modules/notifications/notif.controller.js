import service from "./notif.service.js";
//fcm token registration
async function registerFcmToken(req, res) {
  //swagger.security = [{ "BearerAuth": [] }]
  try {
    const {fcmToken } = req.body;
    const userId = req.user.id;
    if (!userId || !fcmToken) {
      return res.status(400).json({
        error: "userId, role and fcmToken are required",
      });
    }

    await service.saveFcmToken(userId, fcmToken);

    return res.status(200).json({
      message: "FCM token saved successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export default {
  registerFcmToken,

};
