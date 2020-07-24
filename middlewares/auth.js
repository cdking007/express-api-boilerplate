const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/errorHandler");

const Auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT_SEC);
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });
    if (!user) {
      return next(new ApiError("invalid auth", 401));
    }
    req.token = token;
    req.user = user;
    return next();
  } catch (err) {
    return next(new ApiError("invalid auth", 401));
  }
};

module.exports = Auth;
