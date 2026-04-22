import Doctor from "../users/doctor.model.js";

async function addOrUpdateReview(doctorId, patientId, reviewData) {
  const { rating, comment } = reviewData;

  // Validate rating
  if (rating < 0 || rating > 5) {
    throw new Error("Rating must be between 0 and 5");
  }

  // Find doctor
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");

  // Check if the patient already reviewed
  const existingReviewIndex = doctor.review.findIndex(
    r => r.patientId.toString() === patientId.toString()
  );

  let review;
  if (existingReviewIndex !== -1) {
    // Update existing review
    doctor.review[existingReviewIndex].rating = rating;
    doctor.review[existingReviewIndex].comment = comment;
    doctor.review[existingReviewIndex].updatedAt = new Date();
    review = doctor.review[existingReviewIndex];
  } else {
    // Add new review
    review = {
      patientId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    doctor.review.push(review);
  }

  // Update total reviews count
  doctor.totalReviews = doctor.review.length;

  // Calculate average rating
  const sum = doctor.review.reduce((acc, r) => acc + r.rating, 0);
  doctor.averageRating = sum / doctor.totalReviews;

  // Save doctor document
  await doctor.save();

  return review;
}

async function getDoctorReviews(doctorId) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");
  return doctor.review;
}

export default {
  addOrUpdateReview,
  getDoctorReviews
};