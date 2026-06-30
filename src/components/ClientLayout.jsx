import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, LogOut, UserCog, History, ShoppingBag, Phone } from 'lucide-react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { authService } from '../services/authService';
import { ProfileModal } from './ProfileModal';

const ROLE_LABEL = {
  OWNER:    { label: 'Chủ tiệm',   color: 'bg-amber-500' },
  STAFF:    { label: 'Nhân viên',  color: 'bg-sky-500' },
  SHIPPER:  { label: 'Shipper',    color: 'bg-violet-500' },
  CUSTOMER: { label: 'Khách hàng', color: 'bg-emerald-500' },
};

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ClientLayout = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = authService.getCurrentUser();
  const displayName = user?.fullName || user?.username || 'Người dùng';
  const role     = user?.role || 'USER';
  const roleInfo = ROLE_LABEL[role] ?? { label: role, color: 'bg-slate-500' };
  const initials = getInitials(displayName);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    authService.logout();
  };

  const handleOpenProfile = () => {
    setIsDropdownOpen(false);
    setIsProfileOpen(true);
  };

  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      {/* ===== HEADER ===== */}
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

          {/* User info + click dropdown */}
          <div className="flex items-center gap-3 pl-4 border-l border-navy-900 relative" ref={dropdownRef}>
            {/* Text info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold tracking-tight leading-tight">{displayName}</p>
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 text-white ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>

            {/* Avatar — click để mở/đóng dropdown */}
            <div
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-inner cursor-pointer select-none transition-transform hover:scale-110 ${roleInfo.color}`}
              title="Tài khoản"
            >
              {initials}
            </div>

            {/* Click-based dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+12px)] right-0 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-black text-slate-800 dark:text-white truncate">{displayName}</p>
                  <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 text-white ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>

                {/* Tài khoản của tôi */}
                <button
                  onClick={handleOpenProfile}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 transition-all"
                >
                  <UserCog size={14} className="text-sky-500" />
                  Tài khoản của tôi
                </button>

                {/* Lịch sử đơn hàng */}
                <button
                  onClick={() => handleNavigate('/my-orders')}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                >
                  <History size={14} className="text-emerald-500" />
                  Lịch sử đơn hàng
                </button>

                {/* Đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
                >
                  <LogOut size={14} className="text-rose-500" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== NAV TABS ===== */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
                isActive
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`
            }
          >
            <ShoppingBag size={15} />
            Đặt đơn mới
          </NavLink>
          <NavLink
            to="/my-orders"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
                isActive
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`
            }
          >
            <History size={15} />
            Lịch sử đơn hàng
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition-all ${
                isActive
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`
            }
          >
            <Phone size={15} />
            Liên Hệ
          </NavLink>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
