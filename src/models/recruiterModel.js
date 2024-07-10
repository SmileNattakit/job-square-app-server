const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const recruiterSchema = new mongoose.Schema({
  recruiterID: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  logo: String,
  description: String,
  banner: String,
  website: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน
recruiterSchema.methods.hashPassword = async function(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
recruiterSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Recruiter", recruiterSchema);