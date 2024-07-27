const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

// Endpoint for applying for a job
router.post("/apply", applicationController.applyForJob);

// Endpoint for getting applications by job ID
router.get("/:jobId", applicationController.getApplicationsByJob);

// Endpoint for updating applicant status
router.patch("/:id", applicationController.updateApplicantStatus);

// Endpoint for counting applicants by job ID
router.get("/count/:jobId", applicationController.countApplicantsByJob);

module.exports = router;
