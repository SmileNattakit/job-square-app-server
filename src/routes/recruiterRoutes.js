const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const recruiterController = require("../controllers/recruiterController");
const authMiddleware = require("../middleware/authMiddleware");

// กำหนดตำแหน่งที่จะเก็บไฟล์อัพโหลด
const uploadDir = path.join(__dirname, "../uploads/");

// ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดค่า multer สำหรับการอัพโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// สร้าง multer instance พร้อมกับตั้งค่าขนาดไฟล์สูงสุด
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ที่ 5MB
});

// เส้นทางสำหรับการลงทะเบียนผู้รับสมัคร
router.post("/register", recruiterController.registerRecruiter);

// เส้นทางสำหรับการเข้าสู่ระบบของผู้รับสมัคร
router.post("/login", recruiterController.loginRecruiter);

// เส้นทางสำหรับการอัปเดตข้อมูลผู้รับสมัคร
router.patch(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  recruiterController.updateRecruiter
);

// เส้นทางสำหรับการดึงข้อมูลโปรไฟล์ของผู้รับสมัคร
router.get("/:id", authMiddleware, recruiterController.getRecruiterProfile);

// เส้นทางสำหรับการลบบัญชีผู้รับสมัคร (ถ้ามี)
// router.delete("/:id", authMiddleware, recruiterController.deleteRecruiter);

// เส้นทางสำหรับการรีเซ็ตรหัสผ่าน (ถ้ามี)
// router.post("/reset-password", recruiterController.resetPassword);

// เส้นทางสำหรับการเปลี่ยนรหัสผ่าน (ถ้ามี)
// router.post("/change-password", authMiddleware, recruiterController.changePassword);

// เส้นทางสำหรับการดึงรายการตำแหน่งงานที่ประกาศโดยผู้รับสมัคร (ถ้ามี)
// router.get("/:id/jobs", authMiddleware, recruiterController.getRecruiterJobs);

module.exports = router;
