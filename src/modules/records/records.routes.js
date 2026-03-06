const express = require('express')
const router = express.Router()
const controller = require('./records.controller')

router.post('/consultation', controller.createConsultation);
router.get('/consultation/:id', controller.getConsultationById);
router.get('/consultations/:patientId', controller.getConsultations);
router.post('/report', controller.createReport);
router.get('/report/:id', controller.getReportById);
router.get('/reports/:patientId', controller.getReportsByPatientId);

export default router;
