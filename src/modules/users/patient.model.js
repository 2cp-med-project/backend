
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
  role: { type: String, default: "patient" },

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

  // ----------------- OTP Fields -----------------
  otpVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpiresAt: Date,

  createdAt: { type: Date, default: Date.now },
  // apppointment field
  appointments: [
  {
    type: { 
      type: String, 
      enum: ["IRM-RADIO-SCANNER", "ANALYSE", "CONSULTATION"], 
      required: true 
    },
  
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["scheduled", "done", "cancelled"], 
      default: "scheduled" 
    },
    location: String, 
    time:{type:String, required:true},
    appointmentnotes: String,
    reminders: [
      {
        date: { type: Date, required: true }, // when to send the reminder
        sent: { type: Boolean, default: false } // to track if reminder was sent
      }
    ]
  }
]

});

export default mongoose.model("Patient", patientSchema);
