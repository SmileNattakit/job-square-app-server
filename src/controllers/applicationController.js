// controllers/applicationController.js
const Application = require("../models/applicationModel");

exports.applyForJob = async (req, res) => {
  try {
    const { jobId, talentId, message } = req.body;
    const newApplication = new Application({
      jobId,
      talentId,
      message,
    });
    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getApplicationsByJob = async (req, res) => {
  try {
    const applications = await Application.find({
      jobId: req.params.jobId,
    }).populate("talentId");
    res.status(200).json(applications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
