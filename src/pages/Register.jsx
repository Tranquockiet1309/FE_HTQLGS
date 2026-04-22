import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui';

import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();

  if (!formData.username) return;

  setIsLoading(true);

  try {
    const response = await authService.register({
      fullName: formData.fullName,
      username: formData.username,
      phone: formData.phone,
      password: formData.password,
    });

    toast.success(response.message || "Đăng ký thành công!");

    navigate('/login');

  } catch (err) {
    console.log("💥 HANDLE ERROR:", err);
    toast.error(err.response?.data?.message || "Lỗi đăng ký");

  } finally {
    setIsLoading(false);
  }
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthLayout 
      title="Tạo tài khoản mới" 
      subtitle="Tham gia cùng hàng nghìn khách hàng tin dùng QuocKiet."
    >
     <form
  onSubmit={(e) => {
    console.log("FORM HIT");
    handleRegister(e);
  }}
>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và Tên</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
            <input 
              name="fullName"
              type="text" 
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
              <input 
                name="username"
                type="text" 
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="admin123"
                className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số Điện thoại</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
              <input 
                name="phone"
                type="tel" 
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="091 234 5678"
                className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-3 pl-11 pr-11 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 px-1 py-2">
          <input type="checkbox" id="terms" required className="w-4 h-4 mt-0.5 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
          <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400 font-medium cursor-pointer leading-relaxed">
            Tôi đồng ý với <NavLink className="text-sky-500 underline underline-offset-2">Điều khoản dịch vụ</NavLink> và <NavLink className="text-sky-500 underline underline-offset-2">Chính sách bảo mật</NavLink> của QuocKiet.
          </label>
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading}
          className="w-full py-4 text-sm font-black tracking-widest uppercase rounded-2xl shadow-xl shadow-sky-500/20 mt-2"
        >
          ĐĂNG KÝ TÀI KHOẢN
        </Button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-col items-center gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Đã có tài khoản? <NavLink to="/login" className="text-sky-500 font-black hover:underline underline-offset-4">Đăng nhập ngay</NavLink>
        </p>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <ShieldCheck size={14} className="text-emerald-500" />
          Kết nối bảo mật 256-bit
        </div>
      </div>
    </AuthLayout>
  );
};
