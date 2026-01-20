import bcrypt from "bcryptjs";
import { sql } from "../database/db.js";
import { generateToken, decodeToken } from "../utlis/jwt.js";


// CREATE EMPLOYEE 
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      contact_number,
      address,
      dob,
      joining_date,
      monthly_salary,
      role
    } = req.body;

    if (!name || !email || !password || !contact_number || !address || !joining_date || !monthly_salary || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lastEmp = await sql`
      SELECT id FROM employees ORDER BY id DESC LIMIT 1
    `;

    let newEmpId = "EMP001";
    if (lastEmp.length > 0) {
      const lastId = lastEmp[0].id;
      const numPart = parseInt(lastId.replace("EMP", ""));
      const newNum = numPart + 1;
      newEmpId = "EMP" + newNum.toString().padStart(3, "0");
    }

    await sql`
      INSERT INTO employees (
        id, name, email, password, contact_number, address, dob, joining_date,
        monthly_salary, role
      ) VALUES (
        ${newEmpId}, ${name}, ${email}, ${hashedPassword},
        ${contact_number}, ${address}, ${dob}, ${joining_date},
        ${monthly_salary}, ${role}
      )
    `;

    res.status(201).json({
      message: "Employee created successfully",
      employee_id: newEmpId
    });

  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ASSIGN MANAGER
export const assignManager = async (req, res) => {
  try {
    const { empId, managerId } = req.body;

    if (!empId || !managerId) {
      return res.status(400).json({ error: "empId and managerId are required" });
    }

    const employee = await sql`SELECT * FROM employees WHERE id = ${empId}`;
    if (employee.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const manager = await sql`SELECT * FROM employees WHERE id = ${managerId}`;
    if (manager.length === 0) {
      return res.status(404).json({ error: "Manager not found" });
    }

    if (empId === managerId) {
      return res.status(400).json({ error: "Employee cannot be their own manager" });
    }

    await sql`
      UPDATE employees
      SET manager_id = ${managerId}
      WHERE id = ${empId}
    `;

    res.json({ message: `Employee ${empId} is now assigned to manager ${managerId}` });

  } catch (err) {
    console.error("Error assigning manager:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const editEmployee = async (req, res) => {
  try {
    const { empId } = req.params;
    const {
      name,
      email,
      contact_number,
      address,
      dob,
      monthly_salary,
      role,
      manager_id
    } = req.body;

    if (!name || !email || !contact_number || !address || !dob || !monthly_salary || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const employee = await sql`SELECT * FROM employees WHERE id = ${empId}`;
    if (employee.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (manager_id) {
      const manager = await sql`SELECT * FROM employees WHERE id = ${manager_id}`;
      if (manager.length === 0) {
        return res.status(404).json({ error: "Manager not found" });
      }

      if (manager[0].role.toLowerCase() === "employee") {
        return res.status(400).json({ error: "Manager cannot have role 'Employee'" });
      }

      if (manager_id === empId) {
        return res.status(400).json({ error: "Employee cannot be their own manager" });
      }
    }

    await sql`
      UPDATE employees
      SET
        name = ${name},
        email = ${email},
        contact_number = ${contact_number},
        address = ${address},
        dob = ${dob},
        monthly_salary = ${monthly_salary},
        role = ${role},
        manager_id = ${manager_id ?? null}
      WHERE id = ${empId}
    `;

    res.json({ message: `Employee ${empId} details updated successfully` });

  } catch (err) {
    console.error("Error editing employee:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const allowedRoles = ["manager", "hr", "employee", "team leader", "owner"];

export const loginEmployee = async (req, res) => {
  try {
    const { empId, password, role: roleInput } = req.body;

    const role = roleInput.toLowerCase()

    if (!empId || !password || !role) {
      return res.status(400).json({ error: "EmpId, password and role are required" });
    }

    if (role.toLowerCase() === "owner") {
      const ownerId = process.env.OWNER_ID;
      const ownerPass = process.env.OWNER_PASS;

      if (empId === ownerId && password === ownerPass) {
        const token = generateToken({ empId: ownerId, role: "owner" });
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.json({
          message: "Owner login successful",
          token,
        });
      } else {
        return res.status(401).json({ error: "Invalid owner credentials" });
      }
    }

    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(403).json({ error: "Role not allowed to login" });
    }

    const empResult = await sql`
      SELECT e.*, m.name AS manager_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ${empId} AND e.role = ${role}
    `;

    if (empResult.length === 0) {
      return res.status(404).json({ error: "Bad Credentials" });
    }

    const employee = empResult[0];

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken({ empId: employee.id, role: roleInput });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });


    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("Error logging in employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEmployeeData = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    const payload = decodeToken(token);
    if (!payload?.empId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const empId = payload.empId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (empId.toLowerCase() === "owner") {
      const [totalCount] = await sql`
        SELECT COUNT(*)::int AS count FROM employees
      `;
      const employees = await sql`
        SELECT id, name, email, contact_number, role, manager_id
        FROM employees
        ORDER BY id
        LIMIT ${limit} OFFSET ${offset}
      `;

      const ownerEmpData = {
        "name": "owner",
        "role": "owner"
      }

      return res.status(200).json({
        employee: ownerEmpData,
        manager: null,
        subordinates: employees.length > 0 ? employees : null,
        pagination: {
          total: totalCount?.count || 0,
          page,
          limit,
          totalPages: Math.ceil((totalCount?.count || 0) / limit)
        }
      });
    }

    const [employee] = await sql`
      SELECT id, name, email, contact_number, address, dob, joining_date, monthly_salary, role, manager_id
      FROM employees
      WHERE id = ${empId}
    `;

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    let manager = null;
    if (employee.manager_id) {
      [manager] = await sql`
        SELECT id, name, email, contact_number, role
        FROM employees
        WHERE id = ${employee.manager_id}
      `;
    }

    const [totalCount] = await sql`
      SELECT COUNT(*)::int AS count FROM employees WHERE manager_id = ${empId}
    `;
    const subordinates = await sql`
      SELECT id, name, email, contact_number, role
      FROM employees
      WHERE manager_id = ${empId}
      ORDER BY id
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.status(200).json({
      employee,
      manager: manager || null,
      subordinates: subordinates.length > 0 ? subordinates : null,
      pagination: {
        total: totalCount?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching employee hierarchy:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export async function getAllEmployeesWithManager(req, res) {
  try {

    const employees = await sql`
      SELECT 
        e.id,
        e.name,
        e.email,
        e.contact_number,
        e.address,
        e.dob,
        e.joining_date,
        e.monthly_salary,
        e.role,
        e.leaves_allowed,
        m.name AS manager_name
      FROM employees e
      LEFT JOIN employees m 
        ON e.manager_id = m.id
      ORDER BY e.id ASC;
    `;

    const result = employees.map(emp => ({ ...emp }));

     res.status(200).json({
      message: "Employee created successfully",
      employeeData: result
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

