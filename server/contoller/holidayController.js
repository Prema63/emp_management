import {sql} from "../database/db.js";


export const addHoliday = async (req, res) => {
  try {
    const { holiday_date, holiday_name } = req.body;

    if (!holiday_date || !holiday_name) {
      return res.status(400).json({ error: "holiday_date and holiday_name are required" });
    }

    await sql`
      INSERT INTO holidays (holiday_date, holiday_name)
      VALUES (${holiday_date}, ${holiday_name})
    `;

    res.status(201).json({ message: "Holiday added successfully" });
  } catch (error) {
    console.error("Error adding holiday:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Holiday for this date already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getHolidays = async (req, res) => {
  try {
    const holidays = await sql`
      SELECT holiday_date, holiday_name
      FROM holidays
      ORDER BY holiday_date ASC
    `;

    res.status(200).json({ holidays });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
