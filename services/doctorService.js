const asyncHandler = require("express-async-handler");
const Doctor = require("../models/doctorModel");
const factory = require("../services/handlerFactory");
const ApiError = require("../utils/apiError");
const { sendEmail } = require("../utils/sendEmail");
const { sanitizeDoctor } = require("../utils/sanitizeData");
exports.createFilterObject = (req, res, next) => {
  req.filterObject = { isApproved: true };

  next();
};

// @desc    Create a doctor profile
// @route   POST /api/v1/doctors
// @access  Private (doctor or admin)
exports.createDoctor = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "doctor") {
    return next(new ApiError("Only doctors  can create patient profiles", 403));
  }

  req.body.user = req.user._id;

  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    status: "success",
    data: sanitizeDoctor(doctor),
  });
});

// @desc    Get all approved doctors (patients can view)
// @route   GET /api/v1/doctors
// @access  Public
exports.getAllDoctors = factory.getAll(Doctor);

// @desc    Get all approved doctors (patients can view)
// @route   GET /api/v1/doctors
// @access  Public
exports.getDoctor = factory.getOne(Doctor);

// @desc    Update doctor profile
// @route   PUT /api/v1/doctors/:id
// @access  Private (doctor or admin)
exports.updateDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new ApiError("Doctor not found", 404));

  // Only admin or the doctor himself can update
  if (req.user.role !== "admin" && !doctor.user.equals(req.user._id)) {
    return next(
      new ApiError("You are not allowed to update this profile", 403)
    );
  }

  if (req.body.role) delete req.body.role;
  if (req.body.isApproved) delete req.body.isApproved;

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: sanitizeDoctor(updatedDoctor),
  });
});

// @desc    Delete doctor profile
// @route   delete /api/v1/doctors/:id
// @access  Private (doctor or admin)
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new ApiError("Doctor not found", 404));

  // Only admin or the doctor himself can delete
  if (req.user.role !== "admin" && !doctor.user.equals(req.user._id)) {
    return next(
      new ApiError("You are not allowed to delete this profile", 403)
    );
  }

  const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    message: "Doctor deleted successfully",
  });
});

// @desc    Approve doctor (Admin only)
// @route   PATCH /api/v1/doctors/:id/approve
// @access  Private (admin)
exports.approveDoctor = asyncHandler(async (req, res, next) => {
  //1-Check if doctor exist and update
  const doctor = await Doctor.findById(req.params.id).populate({
    path: "user",
    select: "name email phone",
  });

  if (!doctor) return next(new ApiError("Doctor not found", 404));

  // 2️-Update doctor status
  doctor.isVerified = true;
  await doctor.save();

  //3-Send mail to patient
  const user = doctor.user;

  await sendEmail(
    user.email,
    "You are verifyed now",
    `<h3>Hello ${user.name || "Doctor"}</h3>
     <p>Your account has been verified and approved. You can now start accepting appointments.</p>`
  );

  res.status(200).json({
    status: "success",
    message: "Doctor approved successfully",
    data: sanitizeDoctor(doctor),
  });
});
