import service from "./notif.service.js";
//fcm token registration
async function registerFcmToken(req, res) {
  //swagger.security = [{ "BearerAuth": [] }]
  try {
    const { userId, role, fcmToken } = req.body;

    if (!userId || !role || !fcmToken) {
      return res.status(400).json({
        error: "userId, role and fcmToken are required",
      });
    }

    await service.saveFcmToken(userId, role, fcmToken);

    return res.status(200).json({
      message: "FCM token saved successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

//patient response to doctor access request
async function patientResponse(req, res) {
  //swagger.security = [{ "BearerAuth": [] }]
  try {
    const patientId = req.user.id; 
    const { doctorId, accepted } = req.body;

    if (!doctorId || accepted === undefined) {
      return res.status(400).json({
        error: "doctorId and accepted are required",
      });
    }

    const acceptedBool = accepted === true || accepted === "true";

    await service.sendPatientResponseNotification(
      patientId,
      doctorId,
      acceptedBool
    );

    return res.status(200).json({
      message: "Notification sent to doctor",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
export default {
  registerFcmToken,
  patientResponse,
};