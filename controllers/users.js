// errors load
const ApiError = require("../utils/errorHandler");
// api features importing
const ApiFeatures = require("../utils/ApiFeatures");
// models
const User = require("../models/user");

exports.getUsers = async (req, res, next) => {
  try {
    const features = new ApiFeatures(User.find(), req.query)
      .filter()
      .pagination()
      .sort()
      .limitFields();
    const users = await features.query;
    return res.status(200).send({ status: "success", users });
  } catch (err) {
    res.status(500).send({ status: "fail", message: err });
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    // if (user._id.toString() !== req.user._id.toString()) {
    //   return next(new ApiError("bad request", 404));
    // }
    return res.status(200).send({ status: "success", user });
  } catch (err) {
    return next(new ApiError("something want wrong!", 500));
  }
};

exports.patchUserUpdate = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new ApiError("No User found!", 404));
    }

    // if (user._id.toString() !== req.user._id.toString()) {
    //   return next(
    //     new ApiError("you are not allowed to edit other user info!", 400)
    //   );
    // }

    const { username, email } = req.body;
    // TODO: Improve logic
    const emailAlreadyExist = await User.findOne({ email });
    if (emailAlreadyExist && user.email !== emailAlreadyExist.email) {
      return next(new ApiError("user already exist with this email!", 400));
    }
    const usernameAlreadyExist = await User.findOne({ username });
    if (
      usernameAlreadyExist &&
      user.username !== usernameAlreadyExist.username
    ) {
      return next(new ApiError("user already exist with this username!", 400));
    }
    console.log(req.body);
    user.email = email;
    user.username = username;
    await user.save();
    return res.status(200).send({ status: "success", user });
  } catch (err) {
    console.log(err);
    return next(new ApiError("something went wrong!", 500));
  }
};
