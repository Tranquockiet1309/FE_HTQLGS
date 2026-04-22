import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, MoreHorizontal, UserPlus } from 'lucide-react';
import { Card, Badge, Button, cn } from '../components/ui';
import { customerService } from '../services/customerService';
import { toast } from 'react-hot-toast';

export const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách khách hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Khách hàng</h2>
          <p className="text-slate-500 font-medium">Theo dõi và quản lý thông tin khách hàng.</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={20} />
          <span>Thêm Khách hàng</span>
        </Button>
      </div>

      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-sky-500/50 transition-all dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Lọc
          </Button>
        </div>
      </Card>

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
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.customerId} 
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{customer.fullName}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{customer.phone}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={customer.address}>{customer.address || '—'}</td>
                      <td className="px-6 py-4 font-black text-primary-600 dark:text-primary-400 text-right">{customer.totalSpent.toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="info" className="ml-auto inline-flex">{customer.pointBalance}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">
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
        )}
      </Card>
    </div>
  );
};
