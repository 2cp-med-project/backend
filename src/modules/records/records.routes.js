import express from 'express';
const router = express.Router();
import controller from './records.controller';

router.post('/consultation', controller.createConsultation);
router.get('/consultation/:id', controller.getConsultationById);
router.get('/consultations/:patientId', controller.getConsultations);

export default router;
