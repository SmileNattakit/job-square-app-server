const express = require("express");
const router = express.Router();
const talentController = require("../controllers/talentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", talentController.registerTalent);
router.post("/login", talentController.loginTalent);
router.get("/:id", talentController.getTalentData);

module.exports = router;
