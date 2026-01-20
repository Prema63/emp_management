import { sql } from './db.js';

export async function createEmployeeTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        contact_number VARCHAR(15) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        dob DATE,
        joining_date DATE NOT NULL,
        monthly_salary INTEGER NOT NULL,
        role VARCHAR(50) NOT NULL,
        leaves_allowed INTEGER DEFAULT 15,
        manager_id VARCHAR(10),

        CONSTRAINT fk_manager
          FOREIGN KEY (manager_id)
          REFERENCES employees(id)
          ON DELETE SET NULL,

        CONSTRAINT no_self_manager
          CHECK (manager_id IS NULL OR manager_id <> id)
      );
    `
  } catch (error) {
    console.error("Error occur while creating employee table");
  }
}

export async function createAttendanceTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(10) NOT NULL,
        attendance_date DATE NOT NULL,
        is_absent BOOLEAN NOT NULL DEFAULT FALSE,
        is_approved BOOLEAN NOT NULL DEFAULT FALSE,
        approved_by VARCHAR(10),

        CONSTRAINT fk_attendance_employee
          FOREIGN KEY (employee_id)
          REFERENCES employees(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_attendance_approver
          FOREIGN KEY (approved_by)
          REFERENCES employees(id)
          ON DELETE SET NULL
      );
    `
  } catch (error) {
    console.error("Error occur while creating attendence table");
  }
}

export async function createHolidayTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        holiday_date DATE UNIQUE NOT NULL,
        holiday_name VARCHAR(100) NOT NULL
      );
    `
  } catch (error) {
    console.error("Error while creating holiday table");
  }
}

export async function createSalaryTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS salary (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(10) NOT NULL,
        salary_month DATE NOT NULL,
        salary_amount NUMERIC(12,2) NOT NULL,

        CONSTRAINT fk_salary_employee
          FOREIGN KEY (employee_id)
          REFERENCES employees(id)
          ON DELETE CASCADE
      );
    `
  } catch (error) {
    console.error("Error occur while creating salary table.");
  }
}
