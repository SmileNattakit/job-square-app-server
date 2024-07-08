const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  talentId: {
    // เปลี่ยนจาก applicantId เป็น talentId
    type: mongoose.Schema.Types.ObjectId,
    ref: "Talent", // อ้างอิงไปยังโมเดล Talent แทน User
    required: true,
  },
  cv: {
    type: String,
  },
  useCurrentCV: {
    type: Boolean,
    default: true,
  },
  interest: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
    default: "Pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
