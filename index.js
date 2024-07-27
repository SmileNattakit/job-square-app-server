const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Import routes
const jobRoutes = require("./src/routes/jobRoutes");
const recruiterRoutes = require("./src/routes/recruiterRoutes");
const talentRoutes = require("./src/routes/talentRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");

// Use routes
app.use("/jobs", jobRoutes);
app.use("/recruiters", recruiterRoutes);
app.use("/talents", talentRoutes);
app.use("/applications", applicationRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Job Application API");
});

// Error handling for undefined routes
app.use((req, res, next) => {
  res.status(404).send("Route not found");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
