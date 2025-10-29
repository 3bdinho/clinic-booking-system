const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    comment: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
      required: [true, "Review ratings required"],
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "Patient",
      required: [true, "Review must belong to user"],
    },
    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: [true, "Review must belong to Doctor"],
    },
  },
  { timestamps: true }
);

// The patient is not allowed to write more than one review for the same doctor.
reviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

//statics (ratingAverage)
reviewSchema.statics.calcAverageRatings = async function (doctorId) {
  const stats = await this.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: "doctor",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$ratings" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Doctor").findByIdAndUpdate(doctorId, {
      reviewsQuantity: stats[0].nRating,
      reviewsAverage: stats[0].avgRating,
    });
  } else {
    await mongoose.model("Doctor").findByIdAndUpdate(doctorId, {
      reviewsQuantity: 0,
      reviewsAverage: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.doctor);
});

reviewSchema.post("remove", function () {
  this.constructor.calcAverageRatings(this.doctor);
});

module.exports = mongoose.model("Review", reviewSchema);
