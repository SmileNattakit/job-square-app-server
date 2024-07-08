const bcrypt = require("bcrypt");
const Recruiter = require("../models/recruiterModel");

exports.registerRecruiter = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

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

    res
      .status(201)
      .json({ message: "สมัครสมาชิกสำเร็จ", recruiter: newRecruiter });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสมัครสมาชิก:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

exports.loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isPasswordValid = await bcrypt.compare(password, recruiter.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // สร้างและส่ง token (JWT หรืออื่นๆ) ในส่วนนี้ (ถ้ามี)

    res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", recruiter });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ Recruiter:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};
