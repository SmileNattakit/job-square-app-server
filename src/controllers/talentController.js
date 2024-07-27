const validator = require("validator");
const bcrypt = require("bcrypt");
const Talent = require("../models/talentModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // ใช้ HTTPS
});
const generateToken = (userId, role, firstName) => {
  return jwt.sign({ userId, role, firstName }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

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

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
    }
    if (validator.isEmpty(password)) {
      return res.status(400).json({ message: "กรุณากรอกรหัสผ่าน" });
    }

    const talent = await Talent.findOne({ email });
    if (!talent) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isPasswordValid = await bcrypt.compare(password, talent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = generateToken(talent._id, "talent", talent.firstName);
    res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ Talent:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

exports.getTalentData = async (req, res) => {
  try {
    const talentData = await Talent.findById(req.params.id, "-password");
    if (!talentData) {
      return res.status(404).json({ message: "ไม่พบข้อมูล Talent" });
    }
    res.status(200).json(talentData);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Talent:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

exports.updateTalent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // ตรวจสอบว่า Talent มีอยู่จริง
    const existingTalent = await Talent.findById(id);
    if (!existingTalent) {
      return res.status(404).json({ message: "ไม่พบข้อมูล Talent" });
    }

    // จัดการกับการอัพโหลดไฟล์ CV
    if (req.file) {
      try {
        console.log("Uploading new CV file to Cloudinary...");

        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "cv_uploads", resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        const result = await uploadPromise;

        // เก็บ public_id แทน URL เต็ม
        updateData.cvFile = result.public_id;

        // ถ้ามี CV เก่าอยู่ ให้ลบออกจาก Cloudinary
        if (existingTalent.cvFile) {
          await cloudinary.uploader.destroy(existingTalent.cvFile);
        }
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        return res.status(500).json({
          message: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์ CV",
          error: uploadError.message,
        });
      }
    } else if (updateData.removeCv) {
      // ถ้าต้องการลบ CV
      if (existingTalent.cvFile) {
        await cloudinary.uploader.destroy(existingTalent.cvFile);
      }
      updateData.cvFile = null;
    } else {
      // ถ้าไม่มีการเปลี่ยนแปลงเกี่ยวกับ CV ให้ลบ field นี้ออกจาก updateData
      delete updateData.cvFile;
    }

    // ลบ fields ที่ไม่ได้รับการอัพเดตออก
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // อัพเดตข้อมูล Talent
    const updatedTalent = await Talent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // ลบข้อมูลที่ sensitive ออกก่อนส่งกลับ
    const talentResponse = updatedTalent.toObject();
    delete talentResponse.password;

    res.status(200).json({
      message: "อัพเดตข้อมูลสำเร็จ",
      talent: talentResponse,
    });
  } catch (error) {
    console.error("Error in updateTalent:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการอัพเดตข้อมูล",
      error: error.message,
    });
  }
};
exports.downloadCV = async (req, res) => {
  try {
    const { public_id } = req.params;

    // ใช้ cloudinary.url เพื่อสร้าง URL ที่ถูกต้อง
    const url = cloudinary.url(public_id, {
      resource_type: "raw",
      format: "pdf", // หรือ format ที่คุณใช้สำหรับ CV
    });

    res.json({ downloadUrl: url });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสร้าง URL สำหรับดาวน์โหลด",
      error: error.message,
    });
  }
};
