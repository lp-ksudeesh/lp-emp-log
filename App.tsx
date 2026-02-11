
import React, { useState } from 'react';
import Header from './components/Header';
import StatusForm from './components/StatusForm';
import { EmployeeDailyStatus } from './types';
import { CheckCircle2, Home } from 'lucide-react';

const App: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<EmployeeDailyStatus | null>(null);

  const handleFormSubmit = (data: EmployeeDailyStatus) => {
    setLastSubmission(data);
    setSubmitted(true);
    // In a real app, this is where you'd call your API
    console.log('Submission Received:', data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToDashboard = () => {
    setSubmitted(false);
    setLastSubmission(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow py-12 md:py-20 px-4">
        {!submitted ? (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-12 text-center">
              <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase">
                Daily Status
              </h2>
            </div>
            <StatusForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mt-10 animate-fade-in-up">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border-4 border-black overflow-hidden">
              <div className="bg-black p-16 text-center relative">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-black mx-auto mb-8 shadow-xl">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
                  Successfully Submitted
                </h2>
                <div className="h-1 w-20 bg-white/20 mx-auto rounded-full mb-4"></div>
                <p className="text-white font-black opacity-70 tracking-[0.3em] text-[10px] uppercase">
                  Official Log ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Authorized Agent</p>
                      <p className="text-black font-black uppercase text-lg">{lastSubmission?.Full_Name}</p>
                    </div>
                    <div className="space-y-1 md:text-right">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Logged Date</p>
                      <p className="text-black font-black uppercase text-lg">{new Date(lastSubmission?.Work_Date || '').toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Total Duration</p>
                      <p className="text-black font-black uppercase text-lg">{lastSubmission?.Hours_Worked} Hours</p>
                    </div>
                    <div className="space-y-1 md:text-right">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Operation Status</p>
                      <p className={`text-lg font-black uppercase ${lastSubmission?.Work_Status === 'Delayed' ? 'text-red-600' : 'text-green-600'}`}>
                        {lastSubmission?.Work_Status}
                      </p>
                    </div>
                  </div>

                  <div className="pt-12 border-t-4 border-black flex justify-center">
                    <button
                      onClick={returnToDashboard}
                      className="group relative inline-flex items-center justify-center gap-3 px-16 py-8 bg-black text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                    >
                      <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      NEW ENTRY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-12 px-4 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <p className="text-[10px] font-black text-black uppercase tracking-[0.5em] text-center">
            LP PERFORMANCE ORGANIZATION • DAILY LOG TERMINAL
          </p>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
