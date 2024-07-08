const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

router.get("/", companyController.getAllCompanies);
router.get("/:id", companyController.getCompanyById);
router.post("/", companyController.createCompany);

module.exports = router;
