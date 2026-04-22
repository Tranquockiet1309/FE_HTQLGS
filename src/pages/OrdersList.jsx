import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Card, Badge, Button, cn } from '../components/ui';
import { orderService } from '../services/orderService';
import { toast } from 'react-hot-toast';

export const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Đơn hàng</h2>
          <p className="text-slate-500 font-medium">Theo dõi và xử lý tất cả đơn hàng.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/admin/dashboard')}>
          <span>Về Dashboard</span>
        </Button>
      </div>

      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách..."
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
                  <th className="px-6 py-4">Mã đơn</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4">Thanh toán</th>
                  <th className="px-6 py-4">Ngày nhận</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.orderId} 
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                    >
                      <td className="px-6 py-4 font-bold text-primary-600 dark:text-primary-400">{order.orderCode}</td>
                      <td className="px-6 py-4 font-medium">{order.customerName}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={
                          order.status === 'Completed' ? 'success' : 
                          order.status === 'Delivered' ? 'secondary' :
                          ['Washing', 'Drying', 'Ironing'].includes(order.status) ? 'info' : 'warning'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'UNPAID' ? 'warning' : 'info'}>
                          {order.paymentStatus || 'CHƯA TRẢ'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                        {new Date(order.receivedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 font-black text-right">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="xs" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Xem <ChevronRight size={14} className="ml-1" />
                        </Button>
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
