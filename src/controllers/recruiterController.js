const validator = require("validator");
const bcrypt = require("bcrypt");
const Recruiter = require("../models/recruiterModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

exports.updateRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existingRecruiter = await Recruiter.findById(id);
    if (!existingRecruiter) {
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้รับสมัคร" });
    }

    // Handle logo upload
    if (req.files && req.files.logo) {
      console.log("Uploading logo...");
      const logoPath = req.files.logo[0].path;
      const result = await cloudinary.uploader.upload(logoPath, {
        folder: "company_logos",
      });
      console.log("Logo uploaded to Cloudinary:", result.secure_url);
      updateData.logo = result.secure_url;
      fs.unlinkSync(logoPath); // Remove file after upload
      if (existingRecruiter.logo) {
        await cloudinary.uploader.destroy(existingRecruiter.logo);
      }
    } else if (updateData.removeLogo) {
      if (existingRecruiter.logo) {
        await cloudinary.uploader.destroy(existingRecruiter.logo);
      }
      updateData.logo = null;
    }

    // Handle banner upload
    if (req.files && req.files.banner) {
      console.log("Uploading banner...");
      const bannerPath = req.files.banner[0].path;
      const result = await cloudinary.uploader.upload(bannerPath, {
        folder: "company_banners",
      });
      console.log("Banner uploaded to Cloudinary:", result.secure_url);
      updateData.banner = result.secure_url;
      fs.unlinkSync(bannerPath); // Remove file after upload
      if (existingRecruiter.banner) {
        await cloudinary.uploader.destroy(existingRecruiter.banner);
      }
    } else if (updateData.removeBanner) {
      if (existingRecruiter.banner) {
        await cloudinary.uploader.destroy(existingRecruiter.banner);
      }
      updateData.banner = null;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedRecruiter = await Recruiter.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    const recruiterResponse = updatedRecruiter.toObject();
    delete recruiterResponse.password;

    res.status(200).json({
      message: "อัปเดตโปรไฟล์สำเร็จ",
      recruiter: recruiterResponse,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตผู้รับสมัคร:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
      error: error.message,
    });
  }
};

exports.getRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id, "-password");
    if (!recruiter) {
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้รับสมัคร" });
    }
    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
