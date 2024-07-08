const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, //
  },
  logo: String,
  description: String,
  banner: String,
  website: String,
});

module.exports = mongoose.model("Company", companySchema);
