import "./config/env.js"; 
import express from "express";
import {
  createEmployeeTable,
  createAttendanceTable,
  createHolidayTable,
  createSalaryTable
} from "./database/models.js";
import empRouter  from "./routes/employeeRoutes.js";
import holidayRouter from "./routes/holidayRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import salaryRouter from "./routes/salaryRoutes.js";
import { logoutUser } from "./utlis/logout.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();  
app.use(express.json());
app.use(cookieParser())

app.use(
  cors({
    origin: true, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

async function createAllTables() {
  await createEmployeeTable();
  await createAttendanceTable();
  await createHolidayTable();
  await createSalaryTable();
  console.log("All tables created successfully!");
}

createAllTables();

//  routes
app.use("/api/employees", empRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/holidays", holidayRouter);
app.use("/api/salary", salaryRouter);

app.post("/logout", logoutUser)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});
