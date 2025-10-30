const express = require("express");
const { doubleCsrfProtection } = require("../utils/csrf");

const {
  createPatient,
  getAllPatients,
  getPatient,
  updatePatient,
  deletePatient,
  createFilterObject,
} = require("../services/patientService");

const {
  createPatientValidator,
  updatePatientValidator,
  deletePatientValidator,
  getPatientValidator,
} = require("../utils/validators/patientValidator");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

router.use(protect);

// After signup/login
router.post(
  "/",
  doubleCsrfProtection,
  allowedTo("patient"),
  createPatientValidator,
  createPatient
);

// Only patient himself can change his data
router.patch(
  "/:id",
  doubleCsrfProtection,
  allowedTo("patient"),
  updatePatientValidator,
  updatePatient
);

router.delete(
  "/:id",
  doubleCsrfProtection,
  allowedTo("patient", "admin"),
  deletePatientValidator,
  deletePatient
);

// (admin) routes
router.use(allowedTo("admin"));

router.get("/", createFilterObject, getAllPatients);
router.get("/:id", createFilterObject, getPatientValidator, getPatient);

module.exports = router;
