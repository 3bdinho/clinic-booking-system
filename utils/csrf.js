const { doubleCsrf } = require("csrf-csrf");

const CSRF_SECRET = process.env.CSRF_SECRET || "super-secret-key";

const { doubleCsrfProtection, generateCsrfToken, invalidCsrfTokenError } =
  doubleCsrf({
    getSecret: (req) => CSRF_SECRET,
    getSessionIdentifier: (req) => req.ip || "anonymous-session",
    cookieName: "XSRF-TOKEN",
    cookieOptions: {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  });

module.exports = {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
};
