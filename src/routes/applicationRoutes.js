// routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

router.post("/apply", applicationController.applyForJob);
router.get("/:jobId", applicationController.getApplicationsByJob);

module.exports = router;
