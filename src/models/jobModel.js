const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recruiter",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    required: true,
  },
  salary: {
    type: Number,
  },
  posted: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: [
      "Software",
      "Design",
      "Data",
      "Hardware",
      "Content",
      "Engineering",
      "Other",
    ],
  },
  tags: [String],
  description: {
    type: String,
    required: true,
  },
  requirements: [String],
});

module.exports = mongoose.model("Job", jobSchema);
