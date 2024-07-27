const Application = require("../models/applicationModel");

exports.applyForJob = async (req, res) => {
  try {
    const { jobId, talentId, interest, coverLetter } = req.body;

    const newApplication = new Application({
      jobId,
      talentId,
      interest,
      coverLetter,
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

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.countApplicantsByJob = async (req, res) => {
  try {
    const count = await Application.countDocuments({ jobId: req.params.jobId });
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
