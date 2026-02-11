
export interface EmployeeDailyStatus {
  Employee_Id: string;
  Full_Name: string;
  Designation_Role: string;
  Other_Designation_Role?: string;
  Department: string;
  Other_Department?: string;
  Employment_Type: string;
  Shift_Type: string;
  Work_Date: string;
  Work_Status: string;
  Work_Status_Reason?: string;
  Hours_Worked: string;
  Overtime_Hours: string;
  Project_Manager_Name: string;
  Leave_Type: string;
  Task_Summary: string;
  Has_Blockers: 'Yes' | 'No';
  Blocker_Reason?: string;
  Active_Projects_Count: string;
  Project_Names: string;
  Task_Type: string;
  Other_Task_Type?: string;
  Short_Hours_Reason?: string;
  Issue_Dependency_Description?: string;
}

export type StatusFormState = Partial<EmployeeDailyStatus>;
