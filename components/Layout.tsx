
import React from 'react';
import { AppView } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onStaffAccess: () => void;
  onReset: () => void;
  isLinked: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onStaffAccess, onReset, isLinked }) => {
  const isSpecialView = currentView === AppView.WELCOME || currentView === AppView.SUCCESS;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans">
      {!isSpecialView && (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={onReset}>
             <Logo className="h-8" showTagline={false} />
             <div className="h-6 w-[1px] bg-slate-200"></div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Terminal v4</span>
                <span className="text-[8px] font-bold text-[#f7941d] uppercase tracking-tighter mt-1">Lagos, NG Office</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLinked ? 'bg-green-50 border-green-100 text-green-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
               <div className={`w-2 h-2 rounded-full ${isLinked ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-tight">{isLinked ? 'Cloud Linked' : 'Default Mode'}</span>
            </div>
            
            <button 
                onClick={onStaffAccess} 
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-[#000080] hover:bg-slate-100 transition-all rounded-xl font-bold text-xs uppercase"
            >
              <i className="fa-solid fa-gear"></i>
              <span className="hidden md:inline">Admin</span>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="animate-fade-in h-full">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 px-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>© 2024 Cotrac Nigeria</span>
            <span className="text-slate-200">|</span>
            <span className="text-[#f7941d]">Enterprise Grade Integration</span>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield-check text-blue-500 text-xs"></i>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Encrypted Session</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
