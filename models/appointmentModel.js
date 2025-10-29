const mongoose = require("mongoose");

const appointmentsSchema = mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: [true, "appointment must be belong to doctor"],
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "Patient",
      required: [true, "appointment must be belong to patient"],
    },
    startTime: {
      type: Date,
      required: [true, "Appointment start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "Appointment end time is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
appointmentsSchema.index({ doctorId: 1 });
appointmentsSchema.index({ patientId: 1 });
module.exports = mongoose.model("Appointment", appointmentsSchema);
