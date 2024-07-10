const mongoose = require("mongoose");

const talentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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
  phoneNumber: {
    type: String,
    default: "",
  },
  cvFile: {
    type: String,
    default: "",
  },
});

const Talent = mongoose.model("Talent", talentSchema);

module.exports = Talent;
