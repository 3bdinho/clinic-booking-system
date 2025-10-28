const { check } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const mongoose = require("mongoose");

exports.createAppointmentValidator = [
  check("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error("Invalid Doctor ID format");
      }
      return true;
    }),

  check("startTime")
    .notEmpty()
    .withMessage("Appointment start time is required")
    .isISO8601()
    .withMessage("Invalid start time format"),

  check("endTime")
    .notEmpty()
    .withMessage("Appointment end time is required")
    .isISO8601()
    .withMessage("Invalid end time format")
    .custom((endTime, { req }) => {
      const startTime = req.body.startTime;
      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  check("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled"])
    .withMessage("Invalid status value"),

  validatorMiddleware,
];

exports.updateAppointmentValidator = [
  check("startTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid start time format"),

  check("endTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid end time format")
    .custom((endTime, { req }) => {
      if (
        req.body.startTime &&
        new Date(endTime) <= new Date(req.body.startTime)
      ) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  check("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled"])
    .withMessage("Invalid status value"),

  validatorMiddleware,
];

exports.deleteAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid appointment ID format"),
  validatorMiddleware,
];
