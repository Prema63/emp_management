import express from "express";
import { addHoliday, getHolidays } from "../contoller/holidayController.js";

const router = express.Router();

router.post("/", addHoliday);
router.get("/", getHolidays);

export default router;
