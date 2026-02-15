const express = require('express');
const sql = require('mssql');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   SQL CONFIG (Local + Azure)
================================ */

const sqlConfig = process.env.AZURE_SQL_CONNECTIONSTRING
  ? process.env.AZURE_SQL_CONNECTIONSTRING
  : {
      user: process.env.DB_USER || 'sqladmin',
      password: process.env.DB_PASSWORD || 'F7z!DrwBR@%b!Pt8',
      server: process.env.DB_SERVER || 'lp-emp-perf-db.database.windows.net',
      database: process.env.DB_NAME || 'sql-db-8852520',
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    };

const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect()
  .then(() => console.log("Connected to Azure SQL"))
  .catch(err => console.error("Database connection failed:", err));

/* ===============================
   EMPLOYEE LOOKUP BY ID
================================ */

app.get('/employee-by-id/:id', async (req, res) => {
  try {
    await poolConnect;

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
    await poolConnect;

    const r = req.body;

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
   SERVE REACT BUILD
================================ */

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
 