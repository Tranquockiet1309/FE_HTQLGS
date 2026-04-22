import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Shield, Save, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { usersService } from '../services/usersService';
import { toast } from 'react-hot-toast';

export const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    role: 'STAFF',
    isActive: true
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await usersService.getById(id);
        if (response.success) {
          const user = response.data;
          setFormData({
            fullName: user.fullName || '',
            username: user.username || '',
            phone: user.phone || '',
            role: user.role || 'STAFF',
            isActive: user.isActive ?? true
          });
        }
      } catch (error) {
        toast.error('Lỗi khi tải thông tin nhân viên');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await usersService.update(id, formData);
      if (response.success) {
        toast.success('Cập nhật nhân viên thành công!');
        navigate('/admin/users');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật nhân viên');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Chỉnh sửa Nhân viên</h2>
            <p className="text-slate-500 font-medium text-sm">Cập nhật thông tin và quyền hạn cho @{formData.username}</p>
          </div>
        </div>
        <Badge variant={formData.isActive ? "success" : "secondary"} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          {formData.isActive ? "Hoạt động" : "Bị khóa"}
        </Badge>
      </div>

      <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={14} className="text-sky-500" />
                Họ và Tên
              </label>
              <input 
                name="fullName"
                type="text" 
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-50 dark:bg-slate-800/20 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Phone size={14} className="text-sky-500" />
                Số điện thoại
              </label>
              <input 
                name="phone"
                type="tel" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="091 234 5678"
                className="w-full bg-slate-50 dark:bg-slate-800/20 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all dark:text-white"
              />
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Shield size={14} className="text-sky-500" />
                Phân quyền tài khoản
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['OWNER', 'STAFF', 'SHIPPER'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className={`py-3 px-4 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                      formData.role === role 
                        ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/30' 
                        : 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/60 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Status toggle */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={14} className="text-sky-500" />
                Trạng thái hoạt động
              </label>
              <label className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/20 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl cursor-pointer group transition-all hover:border-sky-500/30">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    name="isActive"
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {formData.isActive ? "Đang cho phép truy cập" : "Đang khóa tài khoản"}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="px-8 py-4 rounded-2xl text-xs font-black tracking-widest uppercase"
            >
              HỦY BỎ
            </Button>
            <Button 
              type="submit" 
              isLoading={saving}
              className="px-12 py-4 rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl shadow-sky-500/20"
            >
              <span className="flex items-center gap-2">
                <Save size={18} />
                LƯU THAY ĐỔI
              </span>
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Security Info Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h4 className="font-black text-emerald-700 dark:text-emerald-400 text-sm uppercase tracking-wide">Bảo mật tài khoản</h4>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-500/70 font-medium leading-relaxed mt-1">
            Mọi thay đổi về quyền hạn và trạng thái sẽ có hiệu lực ngay lập tức. Hãy đảm bảo bạn đã xác thực đúng thông tin nhân sự trước khi lưu thay đổi.
          </p>
        </div>
      </div>
    </div>
  );
};
