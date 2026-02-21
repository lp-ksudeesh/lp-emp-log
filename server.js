const express = require('express');
const sql = require('mssql');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
/* ===============================
   SQL CONFIG (ENV BASED ONLY)
================================ */
const sqlConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
let pool;
/* ===============================
   IST UTILITY (FORCE INDIA TIME)
================================ */
const getISTDate = () => {
  const now = new Date();
  const istString = now.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata"
  });
  const istDate = new Date(istString);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
};
/* ===============================
   CONNECT TO DATABASE
================================ */
async function connectDB() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log("✅ Connected to Azure SQL");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}
connectDB();
/* ===============================
   EMPLOYEE LOOKUP BY ID
================================ */
app.get('/employee-by-id/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.request()
      .input('Employee_Id', sql.VarChar, id)
      .query(`
        SELECT Employee_Id, Full_Name, Designation_Role, Department
        FROM Employees
        WHERE Employee_Id = @Employee_Id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Lookup error:", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});
/* ===============================
   SUBMIT DAILY STATUS
================================ */
app.post('/submit-status', async (req, res) => {
  try {
    const r = req.body;
    const today = getISTDate();
    const submittedDate = new Date(r.Work_Date);
    submittedDate.setHours(0, 0, 0, 0);
    /* ===============================
       STRICT IST WORK DATE CHECK
    ================================ */
    if (submittedDate.getTime() !== today.getTime()) {
      return res.status(400).json({
        error: "Work date must be today (IST)."
      });
    }
    /* ===============================
       BASIC HOURS VALIDATION
    ================================ */
    if (isNaN(parseFloat(r.Hours_Worked))) {
      return res.status(400).json({
        error: "Invalid Hours Worked value."
      });
    }
    /* ===============================
       LEAVE VALIDATION
    ================================ */
    if (r.Leave_Type !== "None") {
      if (!r.Leave_Start_Date || !r.Leave_End_Date) {
        return res.status(400).json({
          error: "Leave date range is required."
        });
      }
      const start = new Date(r.Leave_Start_Date);
      const end = new Date(r.Leave_End_Date);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      if (end < start) {
        return res.status(400).json({
          error: "Leave end date cannot be before start date."
        });
      }
      if (r.Leave_Type === "Sick Leave") {
        if (start > today || end > today) {
          return res.status(400).json({
            error: "Sick leave can only be applied for today or past dates."
          });
        }
      } else {
        if (start < today) {
          return res.status(400).json({
            error: "Planned leave cannot be applied for past dates."
          });
        }
      }
      /* Enforce 0 hours if work date inside leave range */
      const isInsideLeave =
        submittedDate >= start && submittedDate <= end;
      if (isInsideLeave && parseFloat(r.Hours_Worked) !== 0) {
        return res.status(400).json({
          error: "Hours must be 0 when work date falls inside leave range."
        });
      }
    } else {
      /* If Leave_Type = None, nullify dates */
      r.Leave_Start_Date = null;
      r.Leave_End_Date = null;
    }
    /* ===============================
       DUPLICATE CHECK
    ================================ */
    const existing = await pool.request()
      .input('Employee_Id', sql.VarChar, r.Employee_Id)
      .input('Work_Date', sql.Date, r.Work_Date)
      .query(`
        SELECT 1 FROM Employee_Daily_Status
        WHERE Employee_Id = @Employee_Id
        AND Work_Date = @Work_Date
      `);
    if (existing.recordset.length > 0) {
      return res.status(400).json({
        error: "Status already submitted for this date."
      });
    }
    /* ===============================
       INSERT
    ================================ */
    await pool.request()
      .input('Employee_Id', sql.VarChar, r.Employee_Id)
      .input('Full_Name', sql.VarChar, r.Full_Name)
      .input('Designation_Role', sql.VarChar, r.Designation_Role)
      .input('Other_Designation_Role', sql.VarChar, r.Other_Designation_Role || null)
      .input('Department', sql.VarChar, r.Department)
      .input('Other_Department', sql.VarChar, r.Other_Department || null)
      .input('Employment_Type', sql.VarChar, r.Employment_Type)
      .input('Shift_Type', sql.VarChar, r.Shift_Type)
      .input('Work_Date', sql.Date, r.Work_Date)
      .input('Work_Status', sql.VarChar, r.Work_Status)
      .input('Work_Status_Reason', sql.NVarChar, r.Work_Status_Reason || null)
      .input('Hours_Worked', sql.Decimal(4, 2), r.Hours_Worked)
      .input('Overtime_Hours', sql.Decimal(4, 2), r.Overtime_Hours || 0)
      .input('Short_Hours_Reason', sql.NVarChar, r.Short_Hours_Reason || null)
      .input('Leave_Type', sql.VarChar, r.Leave_Type)
      .input('Leave_Start_Date', sql.Date, r.Leave_Start_Date)
      .input('Leave_End_Date', sql.Date, r.Leave_End_Date)
      .input('Active_Projects_Count', sql.Int, r.Active_Projects_Count)
      .input('Project_Manager_Name', sql.VarChar, r.Project_Manager_Name)
      .input('Project_Names', sql.VarChar, r.Project_Names)
      .input('Task_Type', sql.VarChar, r.Task_Type)
      .input('Other_Task_Type', sql.VarChar, r.Other_Task_Type || null)
      .input('Task_Summary', sql.NVarChar, r.Task_Summary)
      .input('Has_Blockers', sql.VarChar, r.Has_Blockers)
      .input('Issue_Dependency_Description', sql.NVarChar, r.Issue_Dependency_Description || null)
      .query(`
        INSERT INTO Employee_Daily_Status (
          Employee_Id,
          Full_Name,
          Designation_Role,
          Other_Designation_Role,
          Department,
          Other_Department,
          Employment_Type,
          Shift_Type,
          Work_Date,
          Work_Status,
          Work_Status_Reason,
          Hours_Worked,
          Overtime_Hours,
          Short_Hours_Reason,
          Leave_Type,
          Leave_Start_Date,
          Leave_End_Date,
          Active_Projects_Count,
          Project_Manager_Name,
          Project_Names,
          Task_Type,
          Other_Task_Type,
          Task_Summary,
          Has_Blockers,
          Issue_Dependency_Description
        )
        VALUES (
          @Employee_Id,
          @Full_Name,
          @Designation_Role,
          @Other_Designation_Role,
          @Department,
          @Other_Department,
          @Employment_Type,
          @Shift_Type,
          @Work_Date,
          @Work_Status,
          @Work_Status_Reason,
          @Hours_Worked,
          @Overtime_Hours,
          @Short_Hours_Reason,
          @Leave_Type,
          @Leave_Start_Date,
          @Leave_End_Date,
          @Active_Projects_Count,
          @Project_Manager_Name,
          @Project_Names,
          @Task_Type,
          @Other_Task_Type,
          @Task_Summary,
          @Has_Blockers,
          @Issue_Dependency_Description
        )
      `);
    res.status(200).json({ message: "Saved successfully" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});
/* ===============================
   SERVE FRONTEND
================================ */
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});