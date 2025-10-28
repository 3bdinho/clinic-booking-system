const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const factory = require("../services/handlerFactory");
const Patient = require("../models/patientModel");
const ApiError = require("../utils/apiError");
const { sendEmail } = require("../utils/sendEmail");

// @desc    Create Appointment
// @route   POST /api/v1/appointments
// @access  Public (patient)
exports.createAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, patientId, startTime, endTime, status } = req.body;

  // 1. Check if doctor exists and approved
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isApproved) {
    return next(new ApiError("Doctor not found or not approved", 404));
  }

  // 3. Convert to Date and extract day
  const start = new Date(startTime);
  const end = new Date(endTime);
  const day = start.toLocaleDateString("en-US", { weekday: "long" });

  // 4. Validate day availability
  if (!doctor.availableDays.includes(day)) {
    return next(new ApiError("Doctor is not available on this day", 400));
  }

  // 5. Check working hours
  const [startH, startM] = doctor.availableTime.start.split(":").map(Number);
  const [endH, endM] = doctor.availableTime.end.split(":").map(Number);

  const workStart = new Date(start);
  workStart.setHours(startH, startM, 0, 0);

  const workEnd = new Date(start);
  workEnd.setHours(endH, endM, 0, 0);

  if (workStart > start || workEnd < end) {
    return next(
      new ApiError("Appointment is outside doctor's working hours", 400)
    );
  }

  // 6. Check for time conflict
  const conflict = await Appointment.findOne({
    doctorId: doctor._id,
    $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
  });
  if (conflict) {
    return next(
      new ApiError("Doctor already has an appointment at this time", 400)
    );
  }

  // 7. Create new appointment
  const newApp = await Appointment.create({
    doctorId,
    patientId,
    startTime: start,
    endTime: end,
  });

  // 8. Response
  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: newApp,
  });
});

// @desc    Get all Appointments
// @route   POST /api/v1/appointments
// @access  Private (admin)
exports.getAllAppointments = factory.getAll(Appointment);

// @desc    Get my Appointments
// @route   GET /api/v1/appointments/my
// @access  Private (patient)
exports.getMyAppointments = asyncHandler(async (req, res, next) => {
  // 1.Find patient document linked to this user
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new ApiError("You are not registered as a patient yet", 400));
  }

  // 2️.Get all appointments for this patient
  const appointments = await Appointment.find({
    patientId: patient._id,
  })
    .populate({
      path: "doctorId",
      populate: { path: "user", select: "name" },
    })
    .populate({
      path: "patientId",
      populate: { path: "user", select: "name" },
    });

  // 3️. Send response
  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: appointments,
  });
});

// @desc    Update Appointment
// @route   patch /api/v1/appointments/:id
// @access  Private (patient,admin)
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  // Check if user is patient and owns the appointment
  if (!appointment) {
    return next(new ApiError("Appointment not found", 404));
  }

  const patient = await Patient.findOne({ user: req.user._id });

  if (patient && appointment.patientId.equals(patient._id)) {
    if (req.body.status) delete req.body.status; // remove status if sent
  }

  // Now apply the update safely
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedAppointment,
  });
});

// @desc    Delete Appointment
// @route   delete /api/v1/appointments/:id
// @access  Private (patient,admin)
exports.deleteAppointment = factory.deleteOne(Appointment);

// @desc  Helper for update appointment status
const updateAppointmentStatus = async (
  req,
  res,
  next,
  newStatus,
  notificationOptions = null
) => {
  // 1. Find the appointment
  const appointment = await Appointment.findById(req.params.id).populate({
    path: "patientId",
    select: "user",
  });

  if (!appointment) {
    return next(new ApiError("Appointment not found", 404));
  }

  // 2. Find the logged-in doctor
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new ApiError("You are not registered as a doctor", 403));
  }

  // 3. Ensure doctor owns the appointment
  if (!appointment.doctorId.equals(doctor._id)) {
    return next(
      new ApiError("You are not authorized to confirm this appointment", 403)
    );
  }

  // 4. Check if appointment is pending
  if (appointment.status !== "pending") {
    return next(
      new ApiError("Only pending appointments can be confirmed", 400)
    );
  }

  // 5. Confirm it
  appointment.status = newStatus;
  await appointment.save();

  //6-Send mail to patient
  if (notificationOptions) {
    const user = appointment.patientId.user;
    await sendEmail(
      user,
      notificationOptions.subject,
      notificationOptions.html,
      appointment.notifyBy
    );
  }

  // 6. Respond
  res.status(200).json({
    status: "success",
    message: `Appointment ${newStatus} successfully`,
    data: appointment,
  });
};

// @desc    Cancel appointment (doctor only)
// @route   PATCH /api/v1/appointments/:id/cancel
// @access  Private (doctor)
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  await updateAppointmentStatus(req, res, next, "cancelled", {
    subject: "Your Appointment Has Been Cancelled",
    html: `<h3>Hello</h3><p>Your appointment has been cancelled by the doctor.</p>`,
  });
});

// @desc    Confirm appointment (doctor only)
// @route   PATCH /api/v1/appointments/:id/confirm
// @access  Private (doctor)
exports.confirmAppointment = asyncHandler(async (req, res, next) => {
  await updateAppointmentStatus(req, res, next, "confirmed", {
    subject: "Your Appointment Has Been Confirmed",
    html: `<h3>Hello</h3><p>Your appointment is confirmed.</p>`,
  });
});
