const express = require("express");
const { doubleCsrfProtection } = require("../utils/csrf");
const {
  createDoctor,
  getAllDoctors,
  getDoctor,
  createFilterObject,
  updateDoctor,
  deleteDoctor,
  approveDoctor,
} = require("../services/doctorService");

const {
  createDoctorValidator,
  updateDoctorValidator,
  deleteDoctorValidator,
  getDoctorValidator,
} = require("../utils/validators/doctorValidator");

const authService = require("../services/authService");

const router = express.Router();

// 1)Public Routes
router.get("/", createFilterObject, getAllDoctors);

router.get("/:id", createFilterObject, getDoctor);

// 2)Protected Routes(admin)
router.use(authService.protect);

router.patch(
  "/:id/approved",
  doubleCsrfProtection,
  authService.allowedTo("admin"),
  approveDoctor
);

// 3)Protected Routes(admin / doctor)
router.use(authService.allowedTo("admin", "doctor"));

router.post("/", doubleCsrfProtection, createDoctorValidator, createDoctor);

router
  .route("/:id")
  .patch(doubleCsrfProtection, updateDoctorValidator, updateDoctor)
  .delete(doubleCsrfProtection, deleteDoctorValidator, deleteDoctor);

module.exports = router;
