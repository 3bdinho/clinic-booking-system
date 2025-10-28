const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const { generateToken } = require("../utils/generateToken");
const ApiError = require("../utils/apiError");
const { sendEmail } = require("../utils/sendEmail");

// Generate JWT Token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP,
  });
};
// Helper
const createUserWithRole = asyncHandler(async (req, res, role) => {
  const { name, birthdate, sex, email, phone, password } = req.body;

  const newUser = await User.create({
    name,
    birthdate,
    sex,
    email,
    phone,
    password,
    role,
  });

  const token = generateToken(newUser._id);
  const userData = newUser.toObject();
  delete userData.password;

  res.status(201).json({
    status: "success",
    role,
    data: userData,
    token,
  });
});
// @desc Signup doctor
// @route POST /api/v1/auth/signup/patient
// @access Public
exports.signupPatient = (req, res, next) =>
  createUserWithRole(req, res, "patient");

// @desc Signup doctor
// @route POST /api/v1/auth/signup/doctor
// @access Public
exports.signupDoctor = (req, res, next) =>
  createUserWithRole(req, res, "doctor");

exports.login = asyncHandler(async (req, res, next) => {
  //Check if Patient exist
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  //Compare password
  const correct = await user.comparePassword(req.body.password, user.password);
  if (!user || !correct)
    return next(new ApiError("Incorrect email or password", 401));

  //Generate token
  const token = generateToken(user._id);

  //Remove password from res
  const userData = user.toObject();
  delete userData.password;

  //Send res
  res.status(200).json({
    status: "success",
    data: userData,
    token,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //Check for user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ApiError("No user found with that email", 404));

  //generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send the token
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `
    <h3>Hello ${user.name || "User"}</h3>
    <p>You requested a password reset. Click below:</p>
    <a href="${resetURL}">Reset Password</a>
    <p>If you didn't request this, ignore this email.</p>
  `;

  await sendEmail(user, "Password Reset Link", message, "email");

  //send res
  res.status(200).json({
    status: "success",
    message: "Reset link sent to email",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new ApiError("Token is invalid or expired", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1-Get token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new ApiError("Not authorized, no token", 401));
  }
  const token = authHeader.split(" ")[1];

  // 2-Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3-Find patient by decoded id
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive)
    return next(new ApiError("User no longer exists", 401));

  // 4-Check if password changed after token issued
  if (user.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new ApiError("User recently changed password! Please log in again.", 401)
    );
  }

  // 5-Grant access
  req.user = user;
  next();
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new ApiError("Your current password is wrong", 401));
  }

  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.allowedTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You are not allowed to access this route"));
    }
    next();
  };
