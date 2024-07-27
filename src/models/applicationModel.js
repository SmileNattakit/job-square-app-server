const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  talentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Talent",
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
    default: "Pending",
  },
  interest: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
