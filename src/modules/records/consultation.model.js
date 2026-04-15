import mongoose from "mongoose";

const consultationSchema = mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "in-progress"],
      default: "scheduled",
      required: true,
    },
    date: { type: Date, required: true },
    typeofvisit: String,
    motive: String,
    symptoms: String,
    severity: { type: String, enum: ["light", "mild", "moderate", "severe"] },
    followUpDate: Date,
    diagnosis: String,
    treatmentPlan: String,
    notes: String,
    bloodPressure: String,
    heartRate: String,
    respiratoryRate: String,
    temperature: String,
    weight: String,
    systemReview: String,
    additionalTests: String,
    attachments: [String], //filenames and paths to documents
  },
  { timestamps: true },
);

export default mongoose.model("Consultation", consultationSchema);
