import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, Shield, User, Phone, Lock, UserCircle2, ChevronDown } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/ui';
import { usersService } from '../services/usersService';
import { toast } from 'react-hot-toast';

const ROLES = [
  { value: 'STAFF',   label: 'Nhân viên (STAFF)',   color: 'bg-sky-100 text-sky-700' },
  { value: 'SHIPPER', label: 'Giao hàng (SHIPPER)',  color: 'bg-violet-100 text-violet-700' },
  { value: 'OWNER',   label: 'Quản lý (OWNER)',      color: 'bg-amber-100 text-amber-700' },
];

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
    role: 'STAFF',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
    try {
      await usersService.delete(id);
      toast.success("Xóa nhân viên thành công!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa nhân viên");
    }
  };

  const handleCreate = async () => {
    if (!form.fullName.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error('Vui lòng nhập đầy đủ Họ tên, Username và Mật khẩu');
      return;
    }
    setCreating(true);
    try {
      await usersService.create(form);
      toast.success('Tạo tài khoản thành công! 🎉');
      setIsCreateOpen(false);
      setForm({ fullName: '', username: '', phone: '', password: '', role: 'STAFF' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'OWNER')   return 'warning';
    if (role === 'SHIPPER') return 'info';
    return 'default';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Nhân sự</h2>
          <p className="text-slate-500 font-medium">Danh sách tài khoản Owner, Staff, và Shipper trong hệ thống.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus size={20} />
          <span>Thêm Nhân viên</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Tên Nhân viên</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">SĐT</th>
                  <th className="px-6 py-4 text-center">Phân quyền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Ngày tham gia</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Chưa có dữ liệu nhân viên
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.userId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.role === 'OWNER' ? 'bg-amber-100 text-amber-600' : u.role === 'SHIPPER' ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                            {u.role === 'OWNER' ? <Shield size={16} /> : <User size={16} />}
                          </div>
                          {u.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">@{u.username}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{u.phone || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={u.isActive ? "success" : "secondary"}>
                          {u.isActive ? "Hoạt động" : "Bị khóa"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-sm font-medium">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/admin/users/edit/${u.userId}`}
                            className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:text-sky-600 rounded-lg transition-colors text-slate-400"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(u.userId)}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-600 rounded-lg transition-colors text-slate-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Create User Modal ── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm Nhân viên mới"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Tạo tài khoản đăng nhập cho nhân viên mới trong hệ thống.</p>

          {/* Họ và tên */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="nhanvien01"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>

            {/* SĐT */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  placeholder="0901 234 567"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Phân quyền</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(role => (
                <button
                  key={role.value}
                  onClick={() => setForm({ ...form, role: role.value })}
                  className={`py-2.5 px-3 rounded-xl border-2 text-xs font-black transition-all text-center ${
                    form.role === role.value
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300'
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Hủy
            </button>
            <Button
              className="flex-1 h-12 text-sm gap-2"
              disabled={creating || !form.fullName.trim() || !form.username.trim() || !form.password.trim()}
              onClick={handleCreate}
            >
              {creating ? 'Đang tạo...' : <><Plus size={16} /> Tạo tài khoản</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
