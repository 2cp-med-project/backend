import express from 'express';
import controller from './review.controller.js';
import {authenticate} from '../../middleware/auth.js';

const router = express.Router();


router.post('/submit-review', authenticate, controller.addReview);
router.get('/doctor/:doctorId/get-reviews', authenticate, controller.getReviews);
export default router;