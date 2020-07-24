const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "email address is invalid"],
      trim: true,
      unique: [true, "your email is already in use!"],
      lowercase: true,
      validate: [validator.isEmail, "please provide valid email"],
    },
    username: {
      type: String,
      required: [true, "username is required!"],
      lowercase: true,
      trim: true,
      unique: [true, "username is already in use!"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
      minlength: [6, "password length must be more then 6 char"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "root"],
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpire: {
      type: Date,
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// deleting the tokens and password before sending it to users
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetTokenExpire;
  return userObject;
};

// generating the auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SEC, {
    expiresIn: "90d",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// checking for valid user login
userSchema.statics.findLoginCredential = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    return false;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return false;
  }
  return user;
};

// hasing the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
