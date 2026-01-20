import {sql} from "../database/db.js";
import { decodeToken } from "../utlis/jwt.js";

export const applyLeave = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const { empId } = decodeToken(token);
    const { leave_date } = req.body;

    if (!leave_date) return res.status(400).json({ error: "leave_date is required" });

    await sql`
      INSERT INTO attendance (employee_id, attendance_date, is_absent)
      VALUES (${empId}, ${leave_date}, TRUE)
    `;

    res.status(201).json({ message: "Leave applied successfully" });
  } catch (error) {
    console.error("Error applying leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = decodeToken(token);
    const approverId = payload.empId; 
    const approverRole = payload.role?.toLowerCase();

    const leaveId = req.params.id;

    // Verify the leave exists
    const [leave] = await sql`
      SELECT * FROM attendance WHERE id = ${leaveId}
    `;
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    // Get employee details
    const [employee] = await sql`
      SELECT manager_id, role FROM employees WHERE id = ${leave.employee_id}
    `;

    // Authorization checks
    if (approverRole === "owner") {

    } else if (approverRole === "hr") { 

      if (employee?.role?.toLowerCase() === "hr") {
        return res.status(403).json({ 
          error: "HR cannot approve leaves for other HR employees" 
        });
      }
    } else {

      if (employee?.manager_id !== approverId) {
        return res.status(403).json({ 
          error: "You can only approve leaves for your direct subordinates" 
        });
      }
    }

    
    const [approverExists] = await sql`
      SELECT id FROM employees WHERE id = ${approverId}
    `;
    
    if ( !approverExists && approverRole !== "owner") {
      return res.status(400).json({ 
        error: "Invalid approver ID. Please contact administrator." 
      });
    }

    // Update attendance record
    if( approverId === "owner") {
       await sql`
      UPDATE attendance
      SET is_approved = TRUE
      WHERE id = ${leaveId}
    `;

    }
    else{
      await sql`
      UPDATE attendance
      SET is_approved = TRUE, approved_by = ${approverId}
      WHERE id = ${leaveId}
    `;
    }
 

    res.status(200).json({ message: "Leave approved successfully" });
  } catch (error) {
    console.error("Error approving leave:", error);
  
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: "Invalid approver. The approver ID does not exist in the system." 
      });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = decodeToken(token);
    const empId = payload.empId;
    const role = payload.role?.toLowerCase();

    let leaves;
    if (role === "owner" || role === "hr") {
      leaves = await sql`
        SELECT a.*, e.name AS employee_name, e.role AS employee_role
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        WHERE a.is_approved = FALSE
        ORDER BY a.attendance_date DESC
      `;
    } else {
      leaves = await sql`
        SELECT a.*, e.name AS employee_name, e.role AS employee_role
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        WHERE a.is_approved = FALSE AND e.manager_id = ${empId}
        ORDER BY a.attendance_date DESC
      `;
    }

    res.status(200).json({ leaves: leaves.length ? leaves : null });
  } catch (error) {
    console.error("Error fetching pending leaves:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEmployeeLeaves = async (req, res) => {
  try {
    const empId = req.params.empId;

    const leaves = await sql`
      SELECT a.*, e.name AS employee_name, e.role AS employee_role
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      WHERE a.employee_id = ${empId}
      ORDER BY a.attendance_date DESC
    `;

    res.status(200).json({ leaves: leaves.length ? leaves : null });
  } catch (error) {
    console.error("Error fetching employee leaves:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [totalCount] = await sql`
      SELECT COUNT(*)::int AS count FROM attendance
    `;

    const leaves = await sql`
      SELECT a.*, e.name AS employee_name, e.role AS employee_role
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      ORDER BY a.attendance_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.status(200).json({
      leaves: leaves.length ? leaves : null,
      pagination: {
        total: totalCount?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getLeavesForApproval = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const payload = decodeToken(token);
    const approverId = payload.empId;
    const approverRole = payload.role?.toLowerCase();

    let leaves;

    if (approverRole === "owner") {
      leaves = await sql`
        SELECT 
          a.*, 
          e.name AS employee_name, 
          e.role AS employee_role,
          approver.name AS approved_by_name
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        LEFT JOIN employees approver ON approver.id = a.approved_by
        WHERE a.is_absent = TRUE 
        AND a.is_approved = FALSE
        ORDER BY a.attendance_date DESC
      `;
    }

    else if (approverRole === "hr") {
      leaves = await sql`
        SELECT 
          a.*, 
          e.name AS employee_name, 
          e.role AS employee_role,
          approver.name AS approved_by_name
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        LEFT JOIN employees approver ON approver.id = a.approved_by
        WHERE a.is_absent = TRUE
        AND a.is_approved = FALSE
        AND LOWER(e.role) != 'hr'
        ORDER BY a.attendance_date DESC
      `;
    }
    else {
      leaves = await sql`
        SELECT 
          a.*, 
          e.name AS employee_name, 
          e.role AS employee_role,
          approver.name AS approved_by_name
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        LEFT JOIN employees approver ON approver.id = a.approved_by
        WHERE a.is_absent = TRUE
        AND a.is_approved = FALSE
        AND e.manager_id = ${approverId}
        ORDER BY a.attendance_date DESC
      `;
    }

    return res.status(200).json({
      success: true,
      leaves: leaves.length ? leaves : [],
      count: leaves.length
    });

  } catch (error) {
    console.error("Error fetching role-based leaves:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};