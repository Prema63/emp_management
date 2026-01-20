import express from "express";
import { createEmployee,assignManager,editEmployee,loginEmployee,getEmployeeData, getAllEmployeesWithManager } from "../contoller/employeeContoller.js";
const router = express.Router();

router.post("/create", createEmployee);
router.patch("/assign", assignManager);
router.patch("/update/:empId", editEmployee);
router.post("/login", loginEmployee);
router.get("/empdata", getEmployeeData);
router.get("/getallEmptData", getAllEmployeesWithManager );

export default router;
