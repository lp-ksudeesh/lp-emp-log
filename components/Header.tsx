
import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter text-black uppercase">
              LP PERFORMANCE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
              Terminal Active
            </span>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Link</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
