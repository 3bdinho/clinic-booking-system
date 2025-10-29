const { check } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");

const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("doctor")
    .notEmpty()
    .withMessage("Review must belong to a doctor")
    .isMongoId()
    .withMessage("Invalid doctor id format"),

  check("patient")
    .notEmpty()
    .withMessage("Review must belong to a patient")
    .isMongoId()
    .withMessage("Invalid patient id format"),

  check("ratings")
    .notEmpty()
    .withMessage("Ratings required")
    .isNumeric()
    .withMessage("Ratings should be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),

  check("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string"),

  validatorMiddleware,
];

exports.getDoctorReviewsValidator = [
  check("doctorId")
    .notEmpty()
    .withMessage("Review must belong to a doctor")
    .isMongoId()
    .withMessage("Invalid doctor id format"),

  validatorMiddleware,
];
