const express = require("express");
const router = express.Router();
const talentController = require("../controllers/talentController"); // นำเข้า controller

router.post("/", talentController.registerTalent);
router.get("/login", talentController.loginTalent);

module.exports = router;
