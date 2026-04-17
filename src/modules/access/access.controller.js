import Access from "./access.model.js";
import Patient from "../users/patient.model.js";
import Doctor from "../users/doctor.model.js";
import Notification from "../notifications/notif.service.js";

//Doctor sends access request

async function requestAccess(req, res) {
  // #swagger.tags = ['Access']
  // #swagger.summary = 'Doctor sends access request to a patient'
  // #swagger.description = 'Roles: patient'

  const patientId = req.body.patientId;
  const doctorId = req.user.id;

  try {
    const payload = {
      doctor: doctorId,
      patient: req.body.patientId,
    };
    const existing = await Access.findOne(payload);

    if (existing) {
      res.status(400).json({ message: "A request is already sent" });
      return;
    }

    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const access = await Access.create(payload);

    if (patient.fcmToken) {
      // only send notification if the patient has a registered FCM token
      const message = {
        notification: {
          title: "Access Request",
          body: `Dr. ${doctor.firstName} ${doctor.lastName} wants to access your medical file`,
        },
        data: {
          doctorId: doctorId.toString(),
          type: "ACCESS_REQUEST",
        },
      };
      try {
        await Notification.send(message, patient.fcmToken);
      } catch (error) {
        if (
          error.code === "messaging/invalid-recipient" ||
          error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered"
        ) {
          // The token is invalid, remove it from the database
          await Patient.updateOne(
            { _id: patientId },
            { $unset: { fcmToken: "" } },
          );
        }
      }
    }

    res.status(201).json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient sees pending and active requests

async function getPatientRequests(req, res) {
  // #swagger.tags = ['Access']
  // #swagger.summary = 'Patient sees pending access requests'
  // #swagger.description = 'Roles: patient'

  const patientId = req.user.id;

  try {
    const requests = await Access.find(
      {
        patient: patientId,
        status: { $in: ["pending", "active"] },
      },
      { patient: 1, createdAt: 1 },
    ).lean();

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient approves or rejects

async function respondAccess(req, res) {
  // #swagger.tags = ['Access']
  // #swagger.summary = 'Patient approves or rejects an access request'
  // #swagger.description = 'Roles: patient'

  const accepted = req.body.accepted;
  const accessId = req.params.id;
  const patientId = req.user.id;

  try {
    const access = await Access.findById(accessId);

    if (!access)
      return res.status(404).json({ message: "Access request not found" });

    // Making sure that the logged user is the patient
    if (access.patient.toString() !== patientId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const status = accepted ? "active" : "rejected";

    access.status = status;
    await access.save();

    res.json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Doctor gets approved patients

async function getDoctorPatients(req, res) {
  // #swagger.tags = ['Access']
  // #swagger.summary = 'Doctor sees approved patients'
  // #swagger.description = 'Roles: doctor'

  const doctorId = req.user.id;
  try {
    const accesses = await Access.find(
      {
        doctor: doctorId,
        status: "active",
      },
      { patient: 1, createdAt: 1 },
    ).lean();

    res.json(accesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient gets approved doctors

async function getPatientDoctors(req, res) {
  // #swagger.tags = ['Access']
  // #swagger.summary = 'Patient sees approved doctors'
  // #swagger.description = 'Roles: patient'

  const patientId = req.user.id;

  try {
    const accesses = await Access.find(
      {
        patient: patientId,
        status: "active",
      },
      { doctor: 1, createdAt: 1 },
    ).lean();

    res.json(accesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Patient removes doctor (delete access)

async function removeAccess(req, res) {
  // #swagger.tags = ['Access']
  // #swagger.summary = 'Patient removes a doctor (deletes access)'
  // #swagger.description = 'Roles: patient'

  const patientId = req.user.id;
  const accessId = req.params.id;
  try {
    const access = await Access.findById(accessId);

    if (!access) {
      res.status(404).json({ message: "Access not found" });
      return;
    }

    if (access.patient.toString() !== patientId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await access.deleteOne();

    res.json({ message: "Doctor removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default {
  requestAccess,
  getPatientRequests,
  respondAccess,
  getDoctorPatients,
  getPatientDoctors,
  removeAccess,
};
