const ApiError = require("../utils/errorHandler");
const User = require("../models/user");

exports.isAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "root") {
    return next();
  }
  return next(
    new ApiError("you are not authorized to access this route!", 401)
  );
};

exports.isRoot = (req, res, next) => {
  if (req.user.role === "root") {
    return next();
  }
  return next(
    new ApiError("you are not authorized to access this route!", 401)
  );
};

exports.isCurrentUser = async (req, res, next) => {
  const userId = req.params.id;
  if (req.user._id.toString() !== userId.toString()) {
    return next(new ApiError("no access Available!", 400));
  }
  next();
};
