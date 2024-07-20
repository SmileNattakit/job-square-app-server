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
  .catch((error) => console.error(error));

// นำเข้า routes
const jobRoutes = require("./src/routes/jobRoutes");

const recruiterRoutes = require("./src/routes/recruiterRoute");
const talentRoutes = require("./src/routes/talentRoutes");

// เชื่อมต่อ routes กับ server
app.use("/jobs", jobRoutes);

app.use("/recruiters", recruiterRoutes);
app.use("/talents", talentRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
