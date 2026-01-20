import {sql} from "../database/db.js";

import { decodeToken } from "../utlis/jwt.js";
import PDFDocument from "pdfkit";

export const getSalaryByMonth = async (req, res) => {
    // {"month": "2026-01"} or {"month": "2026-01-01"}


  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const { empId } = decodeToken(token);
    const { month } = req.body;

    if (!month) return res.status(400).json({ error: "Month is required" });

    const monthStart = new Date(month + "-01");
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const [salary] = await sql`
      SELECT monthly_salary FROM employees
      WHERE id = ${empId}
    `;

    res.status(200).json({ salary: salary || null });
  } catch (error) {
    console.error("Error fetching salary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const downloadSalaryPDF = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const { empId } = decodeToken(token);
    const { month } = req.body;

    if (!month) return res.status(400).json({ error: "Month is required" });

    const monthStart = new Date(month + "-01");
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const [salary] = await sql`
      SELECT s.*, e.name, e.role, e.monthly_salary
      FROM salary s
      JOIN employees e ON e.id = s.employee_id
      WHERE s.employee_id = ${empId}
        AND s.salary_month >= ${monthStart}
        AND s.salary_month <= ${monthEnd}
    `;

    if (!salary) return res.status(404).json({ error: "Salary not found" });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=salary_${month}.pdf`);

    doc.fontSize(20).text("Salary Slip", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Employee ID: ${salary.employee_id}`);
    doc.text(`Name: ${salary.name}`);
    doc.text(`Role: ${salary.role}`);
    doc.text(`Salary Month: ${salary.salary_month.toISOString().slice(0, 10)}`);
    doc.text(`Salary Amount: $${salary.salary_amount.toFixed(2)}`);

    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error("Error generating salary PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
