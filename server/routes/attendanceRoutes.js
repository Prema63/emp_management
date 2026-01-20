import express from "express";
import {
  applyLeave,
  approveLeave,
  getPendingLeaves,
  getEmployeeLeaves,
  getAllLeaves,
  getLeavesForApproval
} from "../contoller/attendanceController.js";

const router = express.Router();

router.post("/apply", applyLeave);
router.patch("/approve/:id", approveLeave);
router.get("/pending", getPendingLeaves);
router.get("/employee/:empId", getEmployeeLeaves);
router.get("/", getAllLeaves);
router.get("/getLeavesForApproval", getLeavesForApproval);

export default router;
