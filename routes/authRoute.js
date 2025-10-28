const express = require("express");

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

router.post("/signup/doctor", signupValidator, signupDoctor);
router.post("/signup/patient", signupValidator, signupPatient);

router.post("/login", loginValidator, login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateMyPassword", protect, updatePassword);

module.exports = router;
