import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: String, // for token refresh
  dateOfBirth: Date,
  placeOfBirth: String,
  gender: { type: String, enum: ["male", "female"] },
  phone: String,
  address: String,
  role: {
    type: String,
    default: "patient",
    enum: ["patient"],
    immutable: true,
  },

  emergencyContacts: [
    {
      name: String,
      phone: String,
      relation: String,
    },
  ],
  medicalResume: String, // summary of health history
  cardQRCode: String, // id
  doctorsAccess: [
    {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }, //or name/email
      accepted: { type: Boolean, default: false },
    },
  ],
});

export default mongoose.model("Patient", patientSchema);
