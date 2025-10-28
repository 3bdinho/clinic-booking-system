const asyncHandler = require("express-async-handler");
const Patient = require("../models/patientModel");
const factory = require("../services/handlerFactory");
const ApiError = require("../utils/apiError");

// @desc    Filter patients (if needed)
exports.createFilterObject = (req, res, next) => {
  req.filterObj = { isApproved: true };

  next();
};

// @desc    Create a patient profile
// @route   POST /api/v1/patients
// @access  Private (patient )
exports.createPatient = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "patient") {
    return next(new ApiError("Only patients can create patient profiles", 403));
  }

  req.body.user = req.user._id;

  const patient = await Patient.create(req.body);

  res.status(201).json({
    status: "success",
    data: patient,
  });
});

// @desc    Get all approved patient
// @route   GET /api/v1/patients
// @access  Private(admin)
exports.getAllPatients = factory.getAll(Patient);

// @desc    Get all approved patients
// @route   GET /api/v1/patients
// @access  Private(admin)
exports.getPatient = factory.getOne(Patient);

// @desc    Update patient profile
// @route   PUT /api/v1/patients/:id
// @access  Private (only patient himself)
exports.updatePatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return next(new ApiError("Patient  not found", 404));

  // Only patient himself can update
  if (!patient.user.equals(req.user._id)) {
    return next(
      new ApiError("You are not allowed to update this profile", 403)
    );
  }

  if (req.body.role) delete req.body.role;

  const updatedPatient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedPatient,
  });
});

// @desc    Delete patient profile
// @route   delete /api/v1/patients/:id
// @access  Private (only patient himself , or admin)
exports.deletePatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return next(new ApiError("Patient  not found", 404));

  // Only patient himself or admin can update
  if (req.user.role !== "admin" && !patient.user.equals(req.user._id)) {
    return next(
      new ApiError("You are not allowed to update this profile", 403)
    );
  }

  const deletedPatient = await Patient.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "Delete successfully",
  });
});
