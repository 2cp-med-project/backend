const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }],
  additionalNotes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Record', recordSchema);
