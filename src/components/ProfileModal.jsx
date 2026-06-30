import React, { useState, useEffect } from 'react';
import { X, Lock, MapPin, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';

const TAB = { PASSWORD: 'password', ADDRESS: 'address' };

export const ProfileModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState(TAB.PASSWORD);

  // --- Đổi mật khẩu ---
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // --- Cập nhật địa chỉ ---
  const [address, setAddress] = useState('');
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load địa chỉ hiện tại từ /me
      authService.getMe().then(res => {
        if (res.success) setAddress(res.data?.address || '');
      }).catch(() => {});
      // Reset form
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setPwLoading(true);
    try {
      const res = await authService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      if (res.success) {
        toast.success('Đổi mật khẩu thành công!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onClose();
      } else {
        toast.error(res.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPwLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setAddrLoading(true);
    try {
      const res = await customerService.updateMyAddress(address);
      if (res.success) {
        toast.success('Cập nhật địa chỉ thành công!');
        onClose();
      } else {
        toast.error(res.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    } finally {
      setAddrLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-800 dark:text-white">Tài khoản của tôi</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          <button
            onClick={() => setTab(TAB.PASSWORD)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              tab === TAB.PASSWORD
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound size={14} />
            Đổi mật khẩu
          </button>
          <button
            onClick={() => setTab(TAB.ADDRESS)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              tab === TAB.ADDRESS
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin size={14} />
            Địa chỉ
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Tab: Đổi mật khẩu */}
          {tab === TAB.PASSWORD && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Mật khẩu hiện tại', show: 'current' },
                { key: 'newPassword',     label: 'Mật khẩu mới',      show: 'new' },
                { key: 'confirmPassword', label: 'Xác nhận mật khẩu', show: 'confirm' },
              ].map(({ key, label, show }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type={showPw[show] ? 'text' : 'password'}
                      required
                      value={pwForm[key]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(prev => ({ ...prev, [show]: !prev[show] }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPw[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full mt-2 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {pwLoading ? 'Đang lưu...' : 'Lưu mật khẩu'}
              </button>
            </form>
          )}

          {/* Tab: Địa chỉ */}
          {tab === TAB.ADDRESS && (
            <form onSubmit={handleUpdateAddress} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Địa chỉ nhận/giao đồ</label>
                <textarea
                  rows={4}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-none dark:text-white"
                />
                <p className="text-[11px] text-slate-400">Địa chỉ này sẽ tự động điền khi bạn đặt đơn hàng.</p>
              </div>

              <button
                type="submit"
                disabled={addrLoading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {addrLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
