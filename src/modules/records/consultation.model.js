import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Patiant', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled', required: true },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  followUpDate: Date,
});

export default mongoose.model('Consultation', consultationSchema);
