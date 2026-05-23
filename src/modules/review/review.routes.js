import express from 'express';
import controller from './review.controller.js';
import {authenticate} from '../../middleware/auth.js';

const router = express.Router();
router.use(authenticate);
// Patient submits a review for a doctor
router.post('/doctor/:doctorId/submit-review', authenticate, controller.addReview);
// Doctor views reviews for their profile
router.get('/doctor/:doctorId/get-reviews', authenticate, controller.getReviews);
export default router;