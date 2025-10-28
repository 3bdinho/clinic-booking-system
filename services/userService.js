const factory = require("./handlerFactory");
const User = require("../models/userModel");

exports.createFilterObject = (req, res, next) => {
  // For nested route
  let filterObject = { active: { $ne: false } };

  req.filterObj = filterObject;

  next();
};

// @desc Create user
exports.createUser = factory.createOne(User);

// @desc Get specific user
exports.getUser = factory.getOne(User);

// @desc Get list of users
exports.getAllUsers = factory.getAll(User);

// @desc update specific user
exports.updateUser = factory.updateOne(User);

// @desc delete specific user
exports.deleteUser = factory.deleteOne(User);
