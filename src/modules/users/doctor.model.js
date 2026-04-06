import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "doctor" },
  licenseNumber: { type: String, required: true, unique: true }, //scanning diplomat
  refreshToken: String, // for token refresh
  specialization: String,
  phone: String,
  Address: String, // optional or could be hospital location
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],

  review: [
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
       // not to be displayed in the frontend, just for referencefor privacy reasons
      rating:{
       punctuality: { type: Number, required: true, default: 0 },
      expertise: { type: Number, required: true, default: 0 },
      communication: { type: Number, required: true ,default: 0},
      listening: { type: Number, required: true ,default : 0},},
      comment: { type: String },
      
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
});

export default mongoose.model("Doctor", doctorSchema);
