import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui';

export const Login = () => {
  const [usernameOrPhone, setUsernameOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authService.login({ 
        usernameOrPhone,
        password,
      });
      
      if (response.success) {
        const role = response.data?.role;
        // Backend roles: OWNER, STAFF, SHIPPER
        if (role === 'OWNER' || role === 'STAFF') {
          navigate('/admin/dashboard');
        } else if (role === 'SHIPPER') {
          navigate('/shipper/delivery');
        } else {
          navigate('/');
        }
        toast.success('Đăng nhập thành công!');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout 
      title="Chào mừng trở lại!" 
      subtitle="Đăng nhập để quản lý dịch vụ giặt là của bạn."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Email hoặc Tên đăng nhập</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
            <input 
              type="text" 
              required
              value={usernameOrPhone}
              onChange={(e) => setUsernameOrPhone(e.target.value)}
              placeholder="admin hoặc 0912345678"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Mật khẩu</label>
            <NavLink to="/forgot-password" title="Quên mật khẩu?" className="text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors">Quên mật khẩu?</NavLink>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-12 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
          <label htmlFor="remember" className="text-xs text-slate-500 dark:text-slate-400 font-medium cursor-pointer">Ghi nhớ đăng nhập</label>
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading}
          className="w-full py-4 text-sm font-black tracking-widest uppercase rounded-2xl shadow-xl shadow-sky-500/20"
        >
          ĐĂNG NHẬP NGAY
        </Button>
      </form>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800/60"></div></div>
          <span className="relative px-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-widest">Hoặc đăng nhập bằng</span>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:bg-slate-100 transition-all group">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">GOOGLE</span>
          </button>
          <button className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:bg-slate-100 transition-all group">
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Facebook" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">FACEBOOK</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Chưa có tài khoản? <NavLink to="/register" className="text-sky-500 font-black hover:underline underline-offset-4">Đăng ký mới</NavLink>
        </p>
      </div>
    </AuthLayout>
  );
};
