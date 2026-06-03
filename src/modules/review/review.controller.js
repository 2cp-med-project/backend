import reviewService from "./review.service.js";

const addReview = async (req, res) => {
  try {
    const { ratings, comment } = req.body;
    const patientId = req.user.id;
    const doctorId = req.params.doctorId;

    // Check active access
    const access = await Access.findOne({ doctor: doctorId, patient: patientId, status: "active" });
    if (!access) {
      return res.status(403).json({ message: "Vous ne pouvez pas noter ce médecin (pas d'accès actif)." });
    }

    // Validate ratings exist
    if (!ratings || typeof ratings !== 'object') {
      return res.status(400).json({ message: "Les notes sont requises." });
    }

    const { punctuality, communication, expertise, listening } = ratings;
    if ([punctuality, communication, expertise, listening].some(r => r < 1 || r > 5)) {
      return res.status(400).json({ message: "Les notes doivent être comprises entre 1 et 5." });
    }

    const average = (punctuality + communication + expertise + listening) / 4;
    const finalRating = Math.round(average * 10) / 10;

    const review = await reviewService.addOrUpdateReview(
      doctorId,
      patientId,
      { rating: finalRating, comment }
    );

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await reviewService.getDoctorReviews(doctorId);
    res.status(200).json({ reviews });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default { addReview, getReviews };