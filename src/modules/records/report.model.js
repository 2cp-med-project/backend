import mongoose from 'mongoose';

const reportSchema = mongoose.Schema({

  typeofvisits: { type: String, required: true },
  motive: { type: String, required: true },
  synptoms: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
  followUp: { type: Boolean, required: true },
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
  attachments: [String],
})

export default mongoose.model('Report', reportSchema);
