import reviewService from "../services/review.service.js";

// Add a new review - tout dans body sauf patientId
async function addReview(req, res) {
  // #swagger.tags=['auth'];
  try {
    const { doctorId, rating, comment } = req.body;
    const patientId = req.user.id; // Vient du middleware authenticate

    const reviewData = {
      patientId,
      rating,
      comment
    };

    const review = await reviewService.addOrUpdateReview(doctorId, reviewData);
    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get all reviews for a doctor - doctorId dans params
async function getReviews(req, res) {
  // #swagger.tags=['auth'];
  try {
    const { doctorId } = req.params;

    const reviews = await reviewService.getDoctorReviews(doctorId);
    res.status(200).json({ reviews });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export default {
  addReview,
  getReviews
};