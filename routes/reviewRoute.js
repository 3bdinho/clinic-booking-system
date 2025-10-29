const express = require("express");

const { protect, allowedTo } = require("../services/authService");
const {
  getAllReviews,
  getDoctorReviews,
  createReview,
} = require("../services/reviewService");
const {
  createReviewValidator,
  getDoctorReviewsValidator,
} = require("../utils/validators/reviewValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(allowedTo("patient"), createReviewValidator, createReview)
  .get(allowedTo("admin"), getAllReviews);

router.get("/:doctorId", getDoctorReviewsValidator, getDoctorReviews);

module.exports = router;
