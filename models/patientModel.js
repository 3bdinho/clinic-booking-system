const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  age: {
    type: Number,
    required: true,
  },
  medicalHistory: [String],
});

patientSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name phone email",
  });
  next();
});

module.exports = mongoose.model("Patient", patientSchema);
