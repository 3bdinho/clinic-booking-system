const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Load environment variables
dotenv.config({ path: "config.env" });

// Import modules
const DBConnection = require("./config/database");
const globalErrorHandler = require("./Middlewares/errorMiddleware");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const doctorRoute = require("./routes/doctorRoute");
const patientRoute = require("./routes/patientRoutes");
const appointmentRoute = require("./routes/appointmentRoutes");
const reviewRoute = require("./routes/reviewRoute");
const { reminder } = require("./utils/reminderService");
//Connect with database
DBConnection();

//Express app
const app = express();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

//Middlewares
app.use(express.json());

//reminder
reminder();

//Route
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/patients", patientRoute);
app.use("/api/v1/appointments", appointmentRoute);
app.use("/api/v1/reviews", reviewRoute);
// Global Error Handler
app.use(globalErrorHandler);

const port = process.env.PORT || 7000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
