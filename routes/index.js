const authRoute = require("../routes/authRoute");
const userRoute = require("../routes/userRoute");
const doctorRoute = require("../routes/doctorRoute");
const patientRoute = require("../routes/patientRoutes");
const appointmentRoute = require("../routes/appointmentRoutes");
const reviewRoute = require("../routes/reviewRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/doctors", doctorRoute);
  app.use("/api/v1/patients", patientRoute);
  app.use("/api/v1/appointments", appointmentRoute);
  app.use("/api/v1/reviews", reviewRoute);
};
module.exports = mountRoutes;
