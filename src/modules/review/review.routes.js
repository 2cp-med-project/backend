import express from 'express';
import controller from './review.controller.js';
import {authenticate} from '../../middleware/auth.js';

const router = express.Router();


router.post('/doctor/:doctorId/submitreview',authenticate, controller.addReview);


router.get('/doctor/:doctorId/getreviews',authenticate, controller.getReviews);

export default router;