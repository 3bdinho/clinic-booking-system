const { check } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");

const User = require("../../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .isLength({ max: 32 })
    .withMessage("Too long User name"),

  check("email")
    .notEmpty()
    .withMessage("User email required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) throw new Error("E-mail already exist");
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("User password required")
    .isLength({ min: 6, max: 32 })
    .withMessage("Password must be 6-32 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("User passwordConfirm required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email required")
    .isEmail()
    .withMessage("Invalid user email format"),

  check("password")
    .notEmpty()
    .withMessage("User password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),

  validatorMiddleware,
];
