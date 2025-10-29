const asyncHandler = require("express-async-handler");

const Review = require("../models/reviewModel");
const factory = require("../services/handlerFactory");
const ApiError = require("../utils/apiError");
const { sendResponse } = require("../utils/sendResponse");

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Public (patient)
exports.createReview = factory.createOne(Review);

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getAllReviews = factory.getAll(Review);

// @desc    Get reviews for specific doctor
// @route   GET /api/v1/reviews/:doctorId
// @access  Public (patient)
exports.getDoctorReviews = asyncHandler(async (req, res, next) => {
  console.log("incoming req for doctor:", req.params.doctorId);
  const reviews = await Review.find({ doctor: req.params.doctorId })
    .populate({ path: "patient", select: "name" })
    .populate({ path: "doctor", select: "name" });

  console.log("reviews found:", reviews.length);

  sendResponse(res, reviews, 200);
});
