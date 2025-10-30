const express = require("express");
const { generateCsrfToken } = require("./utils/csrf");

const dotenv = require("dotenv");
const morgan = require("morgan");
const qs = require("qs");
const compression = require("compression");
const hpp = require("hpp");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const nosqlSanitizer = require("express-nosql-sanitizer");
const xssAdvanced = require("xss-advanced");
const { authLimiter, apiLimiter } = require("./utils/rateLimiter");

// Load environment variables
dotenv.config({ path: "config.env" });

// Import modules
const DBConnection = require("./config/database");
const globalErrorHandler = require("./Middlewares/errorMiddleware");
const ApiError = require("./utils/apiError");
const { reminder } = require("./utils/reminderService");
const mountRoutes = require("./routes");

// CSRF protection
const { doubleCsrf } = require("csrf-csrf");

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
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

//cookie parser required for CSRF
app.use(cookieParser(process.env.COOKIE_SECRET || "cookie-secret"));

// CSRF middleware setup
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: (req) => req.secret,
  secret: process.env.CSRF_SECRET || "csrf-secret-key",
  cookieName: "XSRF-TOKEN",
  cookieOptions: {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

//reminder
reminder();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

//To apply data sanitizetion
app.use(nosqlSanitizer());
app.use(xssAdvanced());

// Apply strict limiter only for login & password reset
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/forgotPassword", authLimiter);

// Apply general limiter for all other APIs
app.use("/api", (req, res, next) => {
  // skip limiter for auth routes
  if (req.originalUrl.startsWith("/api/v1/auth/")) {
    return next();
  }
  apiLimiter(req, res, next);
});

//middleware to protect against HTTP parameter pollution attack
app.use(
  hpp({
    whitelist: [
      "specialization",
      "status",
      "sort",
      "fields",
      "category",
      "filter",
      "reviewsQuantity",
      "reviewsAverage",
    ],
  })
);

// Endpoint to provide CSRF token to client
app.get("/api/v1/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.status(200).json({ csrfToken: token });
});

//Mount routes
mountRoutes(app);

// Catch all unknown routes
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
