import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  additionalNotes: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Record', recordSchema);
