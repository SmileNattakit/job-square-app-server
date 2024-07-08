const express = require("express");
const router = express.Router();
const recruiterController = require("../controllers/recruiterController"); // นำเข้า controller

router.post("/", recruiterController.registerRecruiter);
router.get("/login", recruiterController.loginRecruiter);

module.exports = router;
