const express = require("express");
const { doubleCsrfProtection } = require("../utils/csrf");
const {
  signupDoctor,
  signupPatient,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require("../services/authService");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post(
  "/signup/doctor",
  doubleCsrfProtection,
  signupValidator,
  signupDoctor
);
router.post(
  "/signup/patient",
  doubleCsrfProtection,
  signupValidator,
  signupPatient
);

router.post("/login", doubleCsrfProtection, loginValidator, login);

router.post("/forgotPassword", doubleCsrfProtection, forgotPassword);
router.patch("/resetPassword/:token", doubleCsrfProtection, resetPassword);
router.patch(
  "/updateMyPassword",
  doubleCsrfProtection,
  protect,
  updatePassword
);

module.exports = router;
