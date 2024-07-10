const Job = require("../models/jobModel");
const Application = require("../models/applicationModel");
const Talent = require("../models/talentModel");
const Recruiter = require("../models/recruiterModel");

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiterId", "-password");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiterId",
      "-password"
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.body.recruiterId);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const job = new Job({
      title: req.body.title,
      recruiterId: req.body.recruiterId,
      location: req.body.location,
      type: req.body.type,
      salary: req.body.salary,
      category: req.body.category,
      tags: req.body.tags,
      description: req.body.description,
      requirements: req.body.requirements,
    });

    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // อัปเดตฟิลด์ต่างๆ ตามที่ส่งมา
    Object.keys(req.body).forEach((key) => {
      if (job[key] !== undefined) {
        job[key] = req.body[key];
      }
    });

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.remove();
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const talent = await Talent.findById(req.body.talentId);
    if (!talent) {
      return res.status(404).json({ message: "Talent not found" });
    }

    const application = new Application({
      jobId: job._id,
      talentId: req.body.talentId,
      useCurrentCV: req.body.useCurrentCV,
      cv: req.body.cv,
      interest: req.body.interest,
      coverLetter: req.body.coverLetter,
    });

    const newApplication = await application.save();
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
