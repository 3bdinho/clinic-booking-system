const { validationResult } = require("express-validator");

const validatorMiddleware = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }
  next();
};

module.exports = validatorMiddleware;
