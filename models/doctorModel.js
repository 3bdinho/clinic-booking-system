const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Doctor must be linked to a user account"],
      unique: true,
    },

    specialization: {
      type: String,
      required: [true, "Doctor specialization is required"],
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    fees: {
      type: Number,
      required: [true, "Consultation fee is required"],
    },

    clinicAddress: {
      type: String,
      required: [true, "Clinic address is required"],
    },

    availableDays: {
      type: [String],
      default: [],
    },

    availableTime: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },

    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 0.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    reviewsAverage: {
      type: Number,
      default: 0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    reviewsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

doctorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name phone email",
  });
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
