import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserPlus, MoreHorizontal, Phone, MapPin, User } from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { customerService } from '../services/customerService';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 10;

export const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      if (response.success) setCustomers(response.data || []);
    } catch {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleCreate = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error('Vui lòng nhập Họ tên và Số điện thoại');
      return;
    }
    setCreating(true);
    try {
      await customerService.create(form);
      toast.success('Thêm khách hàng thành công! 🎉');
      setIsCreateOpen(false);
      setForm({ fullName: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi thêm khách hàng');
    } finally {
      setCreating(false);
    }
  };

  const filteredCustomers = customers.filter(
    c =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Khách hàng</h2>
          <p className="text-slate-500 font-medium">
            {filteredCustomers.length} khách hàng{searchTerm ? ' (đang lọc)' : ''}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <UserPlus size={20} />
          Thêm Khách hàng
        </Button>
      </div>

      {/* Search */}
      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-sky-500/50 transition-all dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users size={14} />
          <span>Tổng: {customers.length} khách hàng</span>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Tên khách hàng</th>
                    <th className="px-6 py-4">Số điện thoại</th>
                    <th className="px-6 py-4">Địa chỉ</th>
                    <th className="px-6 py-4 text-right">Tổng chi tiêu</th>
                    <th className="px-6 py-4 text-right">Điểm thưởng</th>
                    <th className="px-6 py-4">Ngày tham gia</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        {searchTerm ? 'Không tìm thấy khách hàng phù hợp.' : 'Chưa có khách hàng nào.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map(customer => (
                      <tr
                        key={customer.customerId}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                          {customer.fullName}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">{customer.phone}</td>
                        <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={customer.address}>
                          {customer.address || '—'}
                        </td>
                        <td className="px-6 py-4 font-black text-sky-600 dark:text-sky-400 text-right">
                          {customer.totalSpent.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant="info" className="ml-auto inline-flex">
                            {customer.pointBalance} điểm
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">
                          {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCustomers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>

      {/* ── Create Customer Modal ── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm Khách hàng mới">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Dành cho khách hàng mang đồ trực tiếp đến tiệm và chưa có tài khoản trong hệ thống.
          </p>

          {/* Họ và tên */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
          </div>

          {/* SĐT */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
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

          {/* Địa chỉ */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} />
              <textarea
                placeholder="Địa chỉ (tùy chọn)"
                rows={2}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm resize-none"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <Button
              className="flex-1 h-12 text-sm gap-2"
              disabled={creating || !form.fullName.trim() || !form.phone.trim()}
              onClick={handleCreate}
            >
              {creating ? 'Đang thêm...' : <><UserPlus size={16} /> Thêm Khách hàng</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
