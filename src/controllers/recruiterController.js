const validator = require("validator");
const bcrypt = require("bcrypt");
const Recruiter = require("../models/recruiterModel");
const jwt = require("jsonwebtoken");

const generateToken = (userId, role, companyName) => {
  return jwt.sign({ userId, role, companyName }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};
exports.registerRecruiter = async (req, res) => {
  try {
    const { companyName, email, password, logo, description, banner, website } =
      req.body;

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
      recruiterID: Date.now().toString(), // สร้าง recruiterID อย่างง่าย
      companyName,
      email,
      password: hashedPassword,
      logo,
      description,
      banner,
      website,
    });

    await newRecruiter.save();

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสมัครสมาชิก:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });
    }
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

exports.loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const token = generateToken(
      recruiter._id,
      "recruiter",
      recruiter.companyName
    );
    res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ Recruiter:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

exports.getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({}, "-password");
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecruiterById = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id, "-password");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRecruiter = async (req, res) => {
  try {
    const { companyName, logo, description, banner, website } = req.body;
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      req.params.id,
      { companyName, logo, description, banner, website },
      { new: true, runValidators: true }
    );
    if (!updatedRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    res.json(updatedRecruiter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
