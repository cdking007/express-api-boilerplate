const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_LOCAL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});
