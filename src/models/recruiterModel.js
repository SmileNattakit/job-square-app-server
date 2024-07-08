const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    default: "Recruiter",
  },
});

const Recruiter = mongoose.model("Recruiter", userSchema);

module.exports = Recruiter;
