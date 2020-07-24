// models
const User = require("../models/user");
const ApiError = require("../utils/errorHandler");
const validator = require("validator");
const crypto = require("crypto");

exports.postSignup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return next(new ApiError("email,username,password is required!", 400));
    }

    const regex = /^[A-Za-z0-9]+$/;
    const validUsernameChecker = regex.test(username);
    if (!validUsernameChecker) {
      return next(
        new ApiError("username does not contain special character!", 400)
      );
    }

    // valid mail checker
    const validEmailChecker = validator.isEmail(email);
    if (!validEmailChecker) {
      return next(new ApiError("invalid email", 400));
    }

    // validating the user if already exist
    const checkUser = await User.findOne({ $or: [{ email }, { username }] });
    if (checkUser) {
      return next(
        new ApiError("user already exist with this username or password", 400)
      );
    }

    const user = new User({
      email,
      username,
      password,
    });
    await user.save();
    return res.status(201).json({ status: "success", user: user });
  } catch (err) {
    return next(new ApiError("Something want wrong!", 500));
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findLoginCredential(username, password);
    if (!user) {
      return next(new ApiError("invalid username or password", 401));
    }
    const token = await user.generateAuthToken();
    res.status(200).send({ status: "success", user, token });
  } catch (err) {
    return next(new ApiError("something want wrong!", 500));
  }
};

exports.postPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ApiError("email is required!", 400));
    }
    const bytes = await crypto.randomBytes(32);
    if (!bytes) {
      return next(new ApiError("something went wrong!", 500));
    }
    const token = bytes.toString("hex");
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError("user not found with this email!", 401));
    }
    user.passwordResetToken = token;
    user.passwordResetTokenExpire = Date.now() + 360000;
    await user.save();
    return res
      .status(201)
      .send({ status: "success", message: "check your mail" });
  } catch (err) {
    return next(new ApiError("something went wrong!", 500));
  }
};

exports.getTokenPasswordVerify = async (req, res, next) => {
  try {
    const { email, passwordResetToken } = req.body;
    if (!email || !passwordResetToken) {
      return next(
        new ApiError("email and reset password token is required!", 400)
      );
    }

    const user = await User.findOne({
      email,
      passwordResetToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ApiError("invalid password reset link", 401));
    }
    return res.status(200).send({ status: "success", message: "valid link!" });
  } catch (err) {
    return next(new ApiError("something went wring!", 500));
  }
};

exports.postPasswordResetNewSet = async (req, res, next) => {
  try {
    const { email, passwordResetToken, newPassword } = req.body;
    if (!email || !passwordResetToken || !newPassword) {
      return next(
        new ApiError("email,passwordresettoken,newpassword required!", 400)
      );
    }
    const user = await User.findOne({
      email,
      passwordResetToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ApiError("invalid password reset link", 401));
    }
    user.password = newPassword;
    user.tokens = [];
    user.passwordResetToken = null;
    user.passwordResetTokenExpire = null;
    await user.save();
    res.status(200).send({ status: "success", user });
  } catch (err) {
    return next(new ApiError("something went wring!", 500));
  }
};
