const express = require("express");

const dotenv = require("dotenv");
const morgan = require("morgan");
const qs = require("qs");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// Load environment variables
dotenv.config({ path: "config.env" });

// Import modules
const DBConnection = require("./config/database");
const globalErrorHandler = require("./Middlewares/errorMiddleware");
const ApiError = require("./utils/apiError");
const { reminder } = require("./utils/reminderService");

//Routes
const mountRoutes = require("./routes");

//Connect with database
DBConnection();

//Express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options(/.*/, cors());

//compress all response
app.use(compression());
app.use(helmet());
//override express query parser with qs
app.set("query parser", (str) => qs.parse(str));

//Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

//reminder
reminder();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

//Mount routes
mountRoutes(app);

app.all(/.*/, (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

//Global error handling Middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting down...`);
    process.exit(1);
  });
});
