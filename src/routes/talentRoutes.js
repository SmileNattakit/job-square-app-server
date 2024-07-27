const express = require("express");
const router = express.Router();
const talentController = require("../controllers/talentController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

router.post("/", talentController.registerTalent);
router.post("/login", talentController.loginTalent);

// ย้าย route สำหรับดาวน์โหลด CV มาก่อน route ที่มี :id
router.get(
  "/download-cv/:public_id",
  authMiddleware,
  talentController.downloadCV
);

router.get("/:id", talentController.getTalentData);
router.patch(
  "/:id",
  authMiddleware,
  upload.single("cvFile"),
  talentController.updateTalent
);

module.exports = router;
