const validator = require("validator");
const bcrypt = require("bcrypt");
const Recruiter = require("../models/recruiterModel");
const jwt = require("jsonwebtoken");

// ฟังก์ชันสำหรับสร้าง JWT (ใช้ซ้ำได้)
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

exports.registerRecruiter = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    // Input Validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
    }
    if (validator.isEmpty(password)) {
      return res.status(400).json({ message: "กรุณากรอกรหัสผ่าน" });
    }
    if (validator.isEmpty(companyName)) {
      return res.status(400).json({ message: "กรุณากรอกชื่อบริษัท" });
    }

    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newRecruiter = new Recruiter({
      companyName,
      email,
      password: hashedPassword,
    });

    await newRecruiter.save();

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสมัครสมาชิก:", error);
    if (error.code === 11000) {
      // ตรวจสอบ duplicate key error
      return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });
    }
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

exports.loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
    }
    if (validator.isEmpty(password)) {
      return res.status(400).json({ message: "กรุณากรอกรหัสผ่าน" });
    }

    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isPasswordValid = await bcrypt.compare(password, recruiter.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // สร้างและส่ง token
    const token = generateToken(recruiter._id, "recruiter");
    res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ Recruiter:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};
