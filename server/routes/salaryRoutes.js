import express from "express";
import {
  getSalaryByMonth,
  downloadSalaryPDF
} from "../contoller/salaryController.js";

const router = express.Router();
router.post("/month", getSalaryByMonth);
router.post("/download", downloadSalaryPDF);

export default router;
