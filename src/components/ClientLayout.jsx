import React from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

const ROLE_LABEL = {
  OWNER:   { label: 'Chủ tiệm',   color: 'bg-amber-500' },
  STAFF:   { label: 'Nhân viên',  color: 'bg-sky-500' },
  SHIPPER: { label: 'Shipper',    color: 'bg-violet-500' },
  CUSTOMER:    { label: 'Khách hàng', color: 'bg-emerald-500' },
};

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ClientLayout = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();

  const user = authService.getCurrentUser();
  const displayName = user?.fullName || user?.username || 'Người dùng';
  const role        = user?.role || 'USER';
  const roleInfo    = ROLE_LABEL[role] ?? { label: role, color: 'bg-slate-500' };
  const initials    = getInitials(displayName);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-navy-950 text-white h-16 flex items-center justify-between px-8 sticky top-0 z-50 shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl font-black italic tracking-tighter text-sky-400 cursor-pointer"
            onClick={() => navigate('/')}
          >
            QuocKiet
          </h1>
          <span className="text-[10px] text-navy-400 font-bold uppercase tracking-widest hidden sm:block">
            Laundry Service
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-navy-900/50 text-navy-300 hover:text-white transition-all"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User info + logout popover */}
          <div className="flex items-center gap-3 pl-4 border-l border-navy-900 group relative">
            {/* Text info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold tracking-tight leading-tight">
                {displayName}
              </p>
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 text-white ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>

            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-inner cursor-pointer select-none ${roleInfo.color}`}>
              {initials}
            </div>

            {/* Hover dropdown */}
            <div className="absolute top-[calc(100%+10px)] right-0 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
              {/* User info inside dropdown */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-black text-slate-800 dark:text-white truncate">{displayName}</p>
                <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 text-white ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
              >
                <LogOut size={14} className="text-rose-500" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
