import Doctor from "../users/doctor.model.js";


async function addOrUpdateReview(doctorId, patientId, reviewData) {
  const { rating, comment } = reviewData;

  // Validate rating values
  const keys = ['punctuality', 'expertise', 'communication', 'listening'];
  keys.forEach(key => {
    if (rating[key] < 0 || rating[key] > 5) {
      throw new Error(`${key} rating must be between 0 and 5`);
    }
  });

  // Find doctor
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");

  // Check if the patient already reviewed
  let existingReview = doctor.review.find(
    r => r.patientId.toString() === patientId.toString()
  );

  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.updatedAt = new Date();
  } else {
    // Add new review
    doctor.review.push({
      patientId,
      rating,
      comment,
      updatedAt: new Date()
    });
    existingReview = doctor.review[doctor.review.length - 1];
  }

  
  doctor.totalReviews = doctor.review.length;

  
  let sum = 0;
  doctor.review.forEach(r => {
    sum += r.rating.punctuality;
    sum += r.rating.expertise;
    sum += r.rating.communication;
    sum += r.rating.listening;
  });

  const totalRatings = doctor.totalReviews * keys.length; 
  doctor.averageRating = totalRatings > 0 ? sum / totalRatings : 0;

  // Save doctor document
  await doctor.save();

  return existingReview;
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