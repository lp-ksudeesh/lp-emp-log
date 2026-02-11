
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
    Designation_Role: 'Associate Data Analyst',
    Department: 'Data Engineering',
    Employment_Type: 'Full-time',
    Shift_Type: 'General',
    Work_Status: 'On Track',
    Leave_Type: 'None',
    Task_Type: 'Client Project',
    Work_Date: new Date().toISOString().split('T')[0],
    Hours_Worked: '',
    Overtime_Hours: '0',
    Has_Blockers: 'No'
  });

  const [overtimeSuggested, setOvertimeSuggested] = useState(false);
  const [showShortHoursReason, setShowShortHoursReason] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const countWords = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    if (name === 'Task_Summary') {
      const words = countWords(value);
      if (words > 300) return; // Hard limit at 300 words
      setWordCount(words);
    }

    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };
      
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
        } else {
          setShowShortHoursReason(false);
          setOvertimeSuggested(false);
          newData.Overtime_Hours = '0';
        }
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as EmployeeDailyStatus);
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
      <Icon className="w-5 h-5 text-black" />
      <h3 className="text-sm font-black text-black uppercase tracking-wider">{title}</h3>
    </div>
  );

  const Label = ({ children, required = true }: { children: React.ReactNode, required?: boolean }) => (
    <label className="text-sm font-black text-black ml-1 block mb-2 uppercase tracking-tight">
      {children}
      {required && <span className="text-red-600 ml-1 font-black">*</span>}
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-slate-400/20 border-2 border-black space-y-10"
    >
      {/* 1. Personal & Role Info */}
      <section>
        <SectionTitle icon={User} title="Employee Identification" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <div className="space-y-2">
            <Label>Employee ID</Label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
              <input
                name="Employee_Id"
                type="text"
                placeholder="Ex: EMP-10452"
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
              <input
                name="Full_Name"
                type="text"
                placeholder="Your official name"
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role & Designation</Label>
              <select 
                name="Designation_Role" 
                required 
                className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold cursor-pointer" 
                onChange={handleChange}
                value={formData.Designation_Role}
              >
                {[
                  'Associate Data Analyst', 'Associate Data Engineer', 'Data Engineer',
                  'Data Analyst', 'Data Scientist', 'Manager Data Science',
                  'Data Engineer Lead', 'Data Analyst Lead', 'Associate Data Scientist',
                  'Data Scientist Lead', 'HR Generalist', 'Senior HR Generalist', 'Other'
                ].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            {formData.Designation_Role === 'Other' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                <Label>Specify Role Details</Label>
                <textarea
                  name="Other_Designation_Role"
                  required
                  placeholder="Enter custom role details..."
                  className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl h-24 focus:ring-4 focus:ring-black/10 transition-all text-black font-bold resize-none placeholder:text-slate-300"
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <select 
                name="Department" 
                required 
                className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold cursor-pointer" 
                onChange={handleChange}
                value={formData.Department}
              >
                {['Data Engineering', 'Data Analytics', 'Data Science', 'HR', 'Other'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            {formData.Department === 'Other' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                <Label>Specify Department Details</Label>
                <textarea
                  name="Other_Department"
                  required
                  placeholder="Enter custom department details..."
                  className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl h-24 focus:ring-4 focus:ring-black/10 transition-all text-black font-bold resize-none placeholder:text-slate-300"
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Employment & Shift */}
      <section>
        <SectionTitle icon={Briefcase} title="Work Schedule" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <select name="Employment_Type" required className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold cursor-pointer" onChange={handleChange}>
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Shift</Label>
            <select name="Shift_Type" required className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold cursor-pointer" onChange={handleChange}>
              {['General', 'Night', 'Rotational'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. Performance Metrics */}
      <section>
        <SectionTitle icon={Clock} title="Performance Tracking" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Work Date</Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
              <input
                name="Work_Date"
                type="date"
                defaultValue={formData.Work_Date}
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hours Worked</Label>
            <input
              name="Hours_Worked"
              type="number"
              step="0.1"
              min="0"
              placeholder="Ex: 9.5"
              className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
              required
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label required={false}>Overtime Hours</Label>
            <div className="relative">
              <input
                name="Overtime_Hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.Overtime_Hours || ''}
                placeholder="Ex: 0.5"
                className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
                onChange={handleChange}
              />
              {overtimeSuggested && (
                <span className="absolute -top-6 right-0 text-[10px] text-black font-black flex items-center gap-1 bg-white px-2 rounded-full border border-black">
                  <AlertCircle className="w-2.5 h-2.5" /> AUTO-CALCULATED
                </span>
              )}
            </div>
          </div>
        </div>

        {showShortHoursReason && (
          <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label>Reason for working less than 9 hours?</Label>
            <textarea
              name="Short_Hours_Reason"
              required
              placeholder="Please provide a brief reason for reduced hours today..."
              className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl h-24 focus:ring-4 focus:ring-black/10 transition-all text-black font-bold resize-none placeholder:text-slate-300"
              onChange={handleChange}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <Label>Daily Work Status</Label>
            <select 
              name="Work_Status" 
              required 
              className={`w-full px-4 py-3.5 bg-white border-2 rounded-2xl focus:ring-4 transition-all font-black text-center ${
                formData.Work_Status === 'Delayed' ? 'border-red-600 text-red-600 focus:ring-red-100' : 'border-green-600 text-green-600 focus:ring-green-100'
              }`} 
              onChange={handleChange}
              value={formData.Work_Status}
            >
              <option value="On Track">On Track</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <select name="Leave_Type" required className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold cursor-pointer" onChange={handleChange}>
              {['None', 'Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.Work_Status === 'Delayed' && (
          <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label>Reason for Delay</Label>
            <textarea
              name="Work_Status_Reason"
              required
              placeholder="Why is the status delayed today?"
              className="w-full px-4 py-3.5 bg-white border-2 border-red-600 rounded-2xl h-24 focus:ring-4 focus:ring-red-100 transition-all text-red-600 font-bold resize-none placeholder:text-red-200"
              onChange={handleChange}
            />
          </div>
        )}
      </section>

      {/* 4. Project Details */}
      <section>
        <SectionTitle icon={Layers} title="Project Attribution" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label>Active Projects Count</Label>
            <input
              name="Active_Projects_Count"
              type="number"
              min="0"
              required
              placeholder="Number of projects"
              className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Project Manager</Label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-40" />
              <input
                name="Project_Manager_Name"
                type="text"
                required
                placeholder="Manager's name"
                className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Project Names</Label>
          <input
            name="Project_Names"
            type="text"
            required
            placeholder="Apollo, Falcon, Internal Dashboard..."
            className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 5. Summary & Blockers */}
      <section>
        <SectionTitle icon={ClipboardList} title="Activity Details" />
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label>Task Type</Label>
            <select name="Task_Type" required className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold cursor-pointer" onChange={handleChange}>
              {['Client Project', 'Internal Task', 'Training', 'Innovation', 'Other'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {formData.Task_Type === 'Other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>Specify Task Type</Label>
              <input
                name="Other_Task_Type"
                type="text"
                required
                placeholder="Enter custom task type"
                className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-bold placeholder:text-slate-300"
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-2">
              <Label>Task Summary</Label>
              <span className={`text-[10px] font-black p-1 border border-black rounded-md ${wordCount >= 300 ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>
                {wordCount}/300 WORDS
              </span>
            </div>
            <textarea
              name="Task_Summary"
              placeholder="Describe your primary accomplishments for today..."
              className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl h-32 focus:ring-4 focus:ring-black/10 transition-all text-black font-bold resize-none placeholder:text-slate-300"
              onChange={handleChange}
              required
              value={formData.Task_Summary || ''}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Are there any blockers?</Label>
              <select 
                name="Has_Blockers" 
                required 
                className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl focus:ring-4 focus:ring-black/10 transition-all text-black font-black cursor-pointer"
                onChange={handleChange}
                value={formData.Has_Blockers}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Issue/Dependency Description - Only appears if Has_Blockers is Yes */}
            {formData.Has_Blockers === 'Yes' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black" />
                  <Label>Issue/Dependency Description</Label>
                </div>
                <textarea
                  name="Issue_Dependency_Description"
                  required
                  placeholder="List any issues or dependencies that need attention (Mandatory when blockers exist)..."
                  className="w-full px-4 py-3.5 bg-white border-2 border-black rounded-2xl h-24 focus:ring-4 focus:ring-black/10 transition-all text-black font-bold resize-none placeholder:text-slate-300"
                  onChange={handleChange}
                  value={formData.Issue_Dependency_Description || ''}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="group relative w-full overflow-hidden py-6 bg-black text-white font-black rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-[0.98] border-2 border-white/20"
      >
        <div className="absolute inset-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-xl uppercase tracking-[0.2em]">Finalize & Submit Status</span>
        <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

export default StatusForm;
