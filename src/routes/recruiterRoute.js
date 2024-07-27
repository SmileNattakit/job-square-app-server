const express = require("express");
const router = express.Router();
const recruiterController = require("../controllers/recruiterController"); // นำเข้า controller

router.post("/", recruiterController.registerRecruiter);
router.post("/login", recruiterController.loginRecruiter);
router.get("/:id", recruiterController.getRecruiterById);

module.exports = router;
