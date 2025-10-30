const express = require("express");
const router = express.Router();
const { doubleCsrfProtection } = require("../utils/csrf");

const {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../services/userService");
const { protect, allowedTo } = require("../services/authService");

router.use(protect, allowedTo("admin"));

router.route("/").get(getAllUsers).post(doubleCsrfProtection, createUser);

router
  .route("/:id")
  .get(getUser)
  .patch(doubleCsrfProtection, updateUser)
  .delete(doubleCsrfProtection, deleteUser);

module.exports = router;
