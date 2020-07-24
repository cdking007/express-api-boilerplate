const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

require("express-async-errors");

// custom
const ApiError = require("./utils/errorHandler");
// routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
// db
require("./db/mongodb");

// initiating the express app
const app = express();

// Middlewares
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use(cors());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);
// security helmet 😁
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
// xss prevent attack npm
app.use(xss());
// http perameter pollution
/**
 * to white list some perameter do belowed example
 * app.use(hpp({whitelist:["duration"]}));
 *
 */
app.use(hpp());

// Routes settings
app.use("/api/v1", userRoutes);
app.use("/api/v1/auth", authRoutes);

// 404 router handling
app.all("*", (req, res, next) => {
  next(new ApiError(`cant find the ${req.originalUrl} on the server`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  return res
    .status(err.statusCode)
    .send({ status: err.status, message: err.message });
});

// server start settings
const port = process.env.PORT || 8001;
app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`backend server is started on port ${port}`);
});
