import React, { useState } from 'react';
import {
  User, Briefcase, Calendar, Clock, ClipboardList, AlertCircle,
  Send, ChevronRight, Hash, Layers, Users
} from 'lucide-react';
import { EmployeeDailyStatus } from '../types';

interface Props {
  onSubmit: (data: EmployeeDailyStatus) => void;
}

const StatusForm: React.FC<Props> = ({ onSubmit }) => {

  const [formData, setFormData] = useState<any>({
    Employee_Id: '',
    Full_Name: '',
    Designation_Role: '',
    Department: '',
    Employment_Type: 'Full-time',
    Shift_Type: 'General',
    Work_Status: 'On Track',
    Leave_Type: 'None',
    Task_Type: 'Client Project',
    Work_Date: new Date().toISOString().split('T')[0],
    Hours_Worked: '',
    Overtime_Hours: '0',
    Active_Projects_Count: 0,
    Has_Blockers: 'No'
  });

  const [overtimeSuggested, setOvertimeSuggested] = useState(false);
  const [showShortHoursReason, setShowShortHoursReason] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const countWords = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  // -----------------------------
  // AUTO FILL EMPLOYEE DETAILS
  // -----------------------------
  const fetchEmployeeDetails = async (employeeId: string) => {
    try {
      const response = await fetch(`/employee-by-id/${employeeId}`);
      if (!response.ok) return;

      const data = await response.json();

      setFormData((prev: any) => ({
        ...prev,
        Full_Name: data.Full_Name,
        Designation_Role: data.Designation_Role,
        Department: data.Department
      }));

    } catch (err) {
      console.error("Employee lookup failed:", err);
    }
  };

  // -----------------------------
  // HANDLE INPUT CHANGE
  // -----------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {

    const { name, value } = e.target;

    // Word counter
    if (name === 'Task_Summary') {
      const words = countWords(value);
      if (words > 300) return;
      setWordCount(words);
    }

    setFormData((prev: any) => {

      const newData = { ...prev, [name]: value };

      // Auto calculate overtime
      if (name === 'Hours_Worked') {
        const hours = parseFloat(value);
        if (!isNaN(hours)) {
          if (hours > 9) {
            newData.Overtime_Hours = (hours - 9).toFixed(2);
            setOvertimeSuggested(true);
          } else {
            newData.Overtime_Hours = '0';
            setOvertimeSuggested(false);
          }
          setShowShortHoursReason(hours < 9);
        }
      }

      // Auto calculate project count
      if (name === 'Project_Names') {
        const projects = value
          .split(',')
          .map(p => p.trim())
          .filter(p => p !== '');

        newData.Active_Projects_Count = projects.length;
      }

      return newData;
    });

    // Trigger employee lookup
    if (name === 'Employee_Id' && value.length > 3) {
      fetchEmployeeDetails(value);
    }
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/submit-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        console.error("Insert failed");
        return;
      }

      onSubmit(formData as EmployeeDailyStatus);

    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // -----------------------------
  // UI COMPONENTS
  // -----------------------------
  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
      <Icon className="w-5 h-5 text-black" />
      <h3 className="text-sm font-black text-black uppercase tracking-wider">{title}</h3>
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-sm font-black text-black ml-1 block mb-2 uppercase tracking-tight">
      {children}
      <span className="text-red-600 ml-1 font-black">*</span>
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border-2 border-black space-y-10"
    >

      {/* EMPLOYEE SECTION */}
      <section>
        <SectionTitle icon={User} title="Employee Identification" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <Label>Employee ID</Label>
            <input
              name="Employee_Id"
              value={formData.Employee_Id}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold"
              required
            />
          </div>

          <div>
            <Label>Full Name</Label>
            <input
              name="Full_Name"
              value={formData.Full_Name}
              readOnly
              className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-gray-100"
            />
          </div>

          <div>
            <Label>Role & Designation</Label>
            <input
              name="Designation_Role"
              value={formData.Designation_Role}
              readOnly
              className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-gray-100"
            />
          </div>

          <div>
            <Label>Department</Label>
            <input
              name="Department"
              value={formData.Department}
              readOnly
              className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-gray-100"
            />
          </div>

        </div>
      </section>

      {/* PROJECT SECTION */}
      <section>
        <SectionTitle icon={Layers} title="Project Attribution" />

        <div className="space-y-4">

          <div>
            <Label>Project Names (comma separated)</Label>
            <input
              name="Project_Names"
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold"
              required
            />
          </div>

          <div>
            <Label>Active Projects Count</Label>
            <input
              name="Active_Projects_Count"
              value={formData.Active_Projects_Count}
              readOnly
              className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-gray-100"
            />
          </div>

        </div>
      </section>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full py-5 bg-black text-white font-black rounded-3xl"
      >
        Finalize & Submit Status
      </button>

    </form>
  );
};

export default StatusForm;
 