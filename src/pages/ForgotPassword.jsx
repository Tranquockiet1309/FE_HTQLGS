import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Lock, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui';

export const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(phone, newPassword);
      if (res.success) {
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tìm thấy tài khoản với số điện thoại này');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập số điện thoại đã đăng ký để đặt lại mật khẩu."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Số điện thoại */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
            Số điện thoại đã đăng ký
          </label>
          <div className="relative group">
            <Phone
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
              size={18}
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
            Mật khẩu mới
          </label>
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
              size={18}
            />
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-12 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
              size={18}
            />
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-12 text-sm outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-4 text-sm font-black tracking-widest uppercase rounded-2xl shadow-xl shadow-sky-500/20"
        >
          ĐẶT LẠI MẬT KHẨU
        </Button>
      </form>

      <div className="mt-6 text-center">
        <NavLink
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft size={14} />
          Quay lại đăng nhập
        </NavLink>
      </div>
    </AuthLayout>
  );
};
