import mongoose from 'mongoose';

const consultationSchema = mongoose.Schema({

  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled', required: true },
  typeofvisits: { type: String, required: true },
  motive: { type: String, required: true },
  synptoms: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
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
})

export default mongoose.model('Consultation', consultationSchema);
