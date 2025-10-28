exports.sendResponse = (res, data, statusCode = 200, message = "") => {
  res.status(statusCode).json({
    status: "success",
    msg: message,
    data,
  });
};
