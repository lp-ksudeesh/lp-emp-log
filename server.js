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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const submittedDate = new Date(r.Work_Date);
    submittedDate.setHours(0, 0, 0, 0);

    if (submittedDate > today) {
      return res.status(400).json({
        error: "You cannot submit work for future dates."
      });
    }

    // Duplicate check
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

    // Insert
    await pool.request()
      .input('Employee_Id', sql.VarChar, r.Employee_Id)
      .input('Full_Name', sql.VarChar, r.Full_Name)
      .input('Designation_Role', sql.VarChar, r.Designation_Role)
      .input('Department', sql.VarChar, r.Department)
      .input('Work_Date', sql.Date, r.Work_Date)
      .input('Work_Status', sql.VarChar, r.Work_Status)
      .input('Hours_Worked', sql.Decimal(4, 2), r.Hours_Worked)
      .input('Leave_Type', sql.VarChar, r.Leave_Type)
      .input('Task_Summary', sql.NVarChar, r.Task_Summary)
      .query(`
        INSERT INTO Employee_Daily_Status (
          Employee_Id,
          Full_Name,
          Designation_Role,
          Department,
          Work_Date,
          Work_Status,
          Hours_Worked,
          Leave_Type,
          Task_Summary
        )
        VALUES (
          @Employee_Id,
          @Full_Name,
          @Designation_Role,
          @Department,
          @Work_Date,
          @Work_Status,
          @Hours_Worked,
          @Leave_Type,
          @Task_Summary
        )
      `);

    res.status(200).json({ message: "Saved successfully" });

  } catch (err) {
    console.error("Insert error:", err);
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