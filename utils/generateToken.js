const jwt = require("jsonwebtoken");

exports.generateToken = (payload) =>
  jwt.sign({ id: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP,
  });
