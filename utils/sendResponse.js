exports.sendResponse = (res, data, statusCode = 200, message = "") => {
  return res.status(statusCode).json({
    status: "success",
    msg: message,
    data,
  });
};
