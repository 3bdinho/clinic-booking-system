const { check } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const Doctor = require("../../models/doctorModel");

// ✅ Create Doctor
exports.createDoctorValidator = [
  check("specialization")
    .notEmpty()
    .withMessage("Doctor specialization is required")
    .isString()
    .withMessage("Specialization must be a string"),

  check("experienceYears")
    .optional()
    .isNumeric()
    .withMessage("Experience years must be a number"),

  check("fees")
    .notEmpty()
    .withMessage("Consultation fee is required")
    .isNumeric()
    .withMessage("Consultation fee must be a number"),

  check("clinicAddress")
    .notEmpty()
    .withMessage("Clinic address is required")
    .isString()
    .withMessage("Clinic address must be a string"),

  check("availableDays")
    .notEmpty()
    .withMessage("Available days start is required")
    .isArray()
    .withMessage("Available days must be an array of strings"),

  check("availableTime.start")
    .notEmpty()
    .withMessage("Available time start is required")
    .isString()
    .withMessage("Available time start must be a string"),

  check("availableTime.end")
    .notEmpty()
    .withMessage("Available time end is required")
    .isString()
    .withMessage("Available time end must be a string"),

  validatorMiddleware,
];

// ✅ Get One Doctor
exports.getDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid doctor id format"),
  validatorMiddleware,
];

// ✅ Update Doctor
exports.updateDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid doctor id format"),

  check("fees")
    .optional()
    .isNumeric()
    .withMessage("Consultation fee must be a number"),

  check("experienceYears")
    .optional()
    .isNumeric()
    .withMessage("Experience years must be a number"),

  check("availableDays")
    .optional()
    .isArray()
    .withMessage("Available days must be an array of strings"),

  validatorMiddleware,
];

// ✅ Delete Doctor
exports.deleteDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid doctor id format"),
  validatorMiddleware,
];
