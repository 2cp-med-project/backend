import reviewService from "../services/review.service.js";

// Add a new review - tout dans body sauf patientId
async function addReview(req, res) {
  // #swagger.tags=['auth'];
  try {
    const { rating, comment } = req.body;
    const patientId = req.user.id; // Vient du middleware authenticate
    const doctorId = req.params.doctorId;

    // 1. Vérifier que l'accès actif existe
    const access = await Access.findOne({
      doctor: doctorId,
      patient: patientId,
      status: "active"
    });

    if (!access) {
      return res.status(403).json({
        message: "Vous ne pouvez pas noter ce médecin (pas d'accès actif)."
      });
    }

    // 2. Préparer les données de l'avis
    const reviewData = {
      patientId,
      rating,
      comment
    };

    // 3. Ajouter ou mettre à jour l'avis
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