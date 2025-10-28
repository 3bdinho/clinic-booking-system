const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../services/userService");
const { protect, allowedTo } = require("../services/authService");

router.use(protect, allowedTo("admin"));

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
