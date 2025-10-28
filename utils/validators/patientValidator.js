const { check } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");

const Patient = require("../../models/patientModel");

// ✅ Create Patient
exports.createPatientValidator = [
  check("gender").optional(),
  check("age")
    .notEmpty()
    .withMessage("Patient age required")
    .isNumeric()
    .withMessage("Patient age must be a number"),

  check("phone")
    .notEmpty()
    .withMessage("Patient phone is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  check("medicalHistory").optional(),
  validatorMiddleware,
];

// ✅ Get One Patient
exports.getPatientValidator = [
  check("id")
    .notEmpty()
    .withMessage("User id required")
    .isMongoId()
    .withMessage("Invalid user is format"),
];

// ✅ Update Patient
exports.updatePatientValidator = [
  check("id").isMongoId().withMessage("Invalid patient id format"),
  validatorMiddleware,
];

// ✅ Delete Patient
exports.deletePatientValidator = [
  check("id").isMongoId().withMessage("Invalid patient id format"),
  validatorMiddleware,
];
