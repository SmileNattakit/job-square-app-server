const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company", // อ้างอิงไปยัง Company model
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"], // กำหนดประเภทของงาน
    required: true,
  },
  salary: {
    type: Number, // หรืออาจใช้ Number ขึ้นอยู่กับรูปแบบที่คุณต้องการ
  },
  posted: {
    type: Date,
    default: Date.now, // ตั้งค่าวันที่โพสต์เป็นวันปัจจุบันโดยอัตโนมัติ
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
  tags: [String], // เก็บ tags เป็น array ของ strings
  description: {
    type: String,
    required: true,
  },
  requirements: [String], // เก็บ requirements เป็น array ของ strings
  // เพิ่มเติม field อื่นๆ ตามต้องการ เช่น benefits, howToApply, etc.
});

module.exports = mongoose.model("Job", jobSchema);
