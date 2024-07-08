const validator = require("validator");
const bcrypt = require("bcrypt");
const Talent = require("../models/talentModel");
const jwt = require("jsonwebtoken");

exports.registerTalent = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Input Validation
    if (
      !validator.isEmail(email) ||
      validator.isEmpty(firstName) ||
      validator.isEmpty(lastName) ||
      validator.isEmpty(password)
    ) {
      return res
        .status(400)
        .json({ message: "ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง" });
    }

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingTalent = await Talent.findOne({ email });
    if (existingTalent) {
      return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });
    }

    // เข้ารหัส password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // สร้าง Talent ใหม่
    const newTalent = new Talent({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // บันทึก Talent ลง database
    await newTalent.save();

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", talent: newTalent });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสมัครสมาชิก Talent:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

exports.loginTalent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const talent = await Talent.findOne({ email });
    if (!talent) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isPasswordValid = await bcrypt.compare(password, talent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // สร้าง JWT
    const token = jwt.sign(
      {
        userId: talent._id,
        role: "talent",
        firstname: talent.firstName, // เพิ่ม firstname
        lastname: talent.lastName, // เพิ่ม lastname
        email: talent.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // กำหนดอายุของ token (เช่น 1 ชั่วโมง)
    );

    res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ Talent:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};
