const express = require("express");
const { doubleCsrfProtection } = require("../utils/csrf");
const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getMyAppointments,
  getAllAppointments,
} = require("../services/appointmentService");

const {
  createAppointmentValidator,
  updateAppointmentValidator,
  deleteAppointmentValidator,
} = require("../utils/validators/appointmentValidator");
router.use(protect);

// Doctor cancels their own appointment
router.patch(
  "/:id/cancel",
  doubleCsrfProtection,
  allowedTo("doctor"),
  cancelAppointment
);
router.patch(
  "/:id/confirm",
  doubleCsrfProtection,
  allowedTo("doctor"),
  confirmAppointment
);

// (Patient only)
router.post(
  "/",
  doubleCsrfProtection,
  allowedTo("patient"),
  createAppointmentValidator,
  createAppointment
);
router.get("/my", allowedTo("patient"), getMyAppointments);

// (Patient or Admin)
router.patch(
  "/:id",
  doubleCsrfProtection,
  allowedTo("patient", "admin"),
  updateAppointmentValidator,
  updateAppointment
);
router.delete(
  "/:id",
  doubleCsrfProtection,
  allowedTo("patient", "admin"),
  deleteAppointmentValidator,
  deleteAppointment
);

// Routes for admin
router.get("/", allowedTo("admin"), getAllAppointments);

module.exports = router;
