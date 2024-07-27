const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const recruiterSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    logo: String,
    banner: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    companySize: {
      type: String,
      enum: ["1-50", "51-100", "101-1000", "1000+"],
    },
    location: {
      type: String,
    },
    description: String,
    phoneNumber: String,
  },
  { timestamps: true }
);

recruiterSchema.methods.hashPassword = async function (password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

recruiterSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Recruiter", recruiterSchema);
