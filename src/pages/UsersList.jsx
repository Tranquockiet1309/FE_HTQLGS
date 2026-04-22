import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, Shield, User } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { usersService } from '../services/usersService';
import { toast } from 'react-hot-toast';

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Nhân sự</h2>
          <p className="text-slate-500 font-medium">Danh sách tài khoản Owner, Staff, và Shipper trong hệ thống.</p>
        </div>
        <Button className="gap-2">
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
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.role === 'OWNER' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                          {u.role === 'OWNER' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        {u.fullName}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">@{u.username}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{u.phone || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={u.role === 'OWNER' ? "warning" : u.role === 'SHIPPER' ? "info" : "default"}>
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
    </div>
  );
};
