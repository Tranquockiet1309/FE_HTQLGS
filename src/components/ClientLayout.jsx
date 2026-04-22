import React from 'react';
import { Moon, Sun, Bell, User, LogOut } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';

export const ClientLayout = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-navy-950 text-white h-16 flex items-center justify-between px-8 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black italic tracking-tighter text-sky-400 cursor-pointer" onClick={() => navigate('/')}>QuocKiet</h1>
          <span className="text-[10px] text-navy-400 font-bold uppercase tracking-widest hidden sm:block">Laundry Service</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-navy-900/50 text-navy-300 hover:text-white transition-all"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-navy-900 group relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold tracking-tight">Nguyễn Văn A</p>
              <p className="text-[10px] text-navy-400 font-bold uppercase">Khách hàng</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white shadow-inner">
              NA
            </div>
            
            {/* Popover Logout (Simple) */}
            <button 
              onClick={() => navigate('/login')}
              className="absolute top-12 right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-xl rounded-xl py-2 px-4 text-xs font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all border border-slate-100 dark:border-slate-800"
            >
              <LogOut size={14} className="text-rose-500" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
