const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.post("/", authMiddleware, jobController.createJob);
router.patch("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);
router.post("/:id/apply", jobController.applyForJob);

module.exports = router;
