import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  RotateCcw, 
  Clock, 
  DollarSign, 
  MoreHorizontal,
  Plus,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, Badge, Button, cn } from '../components/ui';
import { orderService } from '../services/orderService';
import { deliveryService } from '../services/deliveryService';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card className="flex flex-col gap-4 group hover:scale-[1.02] transition-all">
    <div className="flex items-center justify-between">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-full",
          trend.startsWith('+') ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        )}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
    </div>
  </Card>
);

export const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getAll();
      const shippersData = await deliveryService.getShippers();
      
      // Process orders to match UI expectations if needed
      setOrders(ordersData.data || []);
      setShippers(shippersData.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignShipper = async (orderId, shipperId) => {
    try {
      await deliveryService.assignShipper(orderId, shipperId);
      toast.success("Gán shipper thành công!");
      setAssigningId(null);
      fetchData(); // Refresh list
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi gán shipper";
      toast.error(errorMsg);
    }
  };

  const stats = [
    { title: "Today's New Orders", value: orders.filter(o => new Date(o.receivedAt).toDateString() === new Date().toDateString()).length, icon: ShoppingBag, color: "bg-primary-500", trend: "+12%" },
    { title: "In Processing", value: orders.filter(o => ['Washing', 'Drying', 'Ironing'].includes(o.status)).length, icon: RotateCcw, color: "bg-sky-500" },
    { title: "Ready for Delivery", value: orders.filter(o => o.status === 'Completed').length, icon: CheckCircle, color: "bg-emerald-500" },
    { title: "Total Pending", value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: "bg-amber-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Dashboard</h2>
          <p className="text-slate-500 font-medium">Chào mừng trở lại, Quản lý Tiệm Giặt Say.</p>
        </div>
        <Button className="gap-2">
          <Plus size={20} />
          <span>Tạo đơn mới</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-tight">Đơn hàng gần đây</h3>
          <Button variant="outline" size="sm">Xem tất cả</Button>
        </div>
        
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4">Ngày nhận</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.orderId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
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
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                    {new Date(order.receivedAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 font-black">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'Completed' && (
                        <div className="relative">
                          {assigningId === order.orderId ? (
                            <select 
                              className="text-xs border-2 border-primary-500 rounded-lg p-1 outline-none"
                              autoFocus
                              onChange={(e) => handleAssignShipper(order.orderId, e.target.value)}
                              onBlur={() => setAssigningId(null)}
                            >
                              <option value="">Chọn Shipper</option>
                              {shippers.map(s => (
                                <option key={s.shipperId} value={s.shipperId}>{s.name}</option>
                              ))}
                            </select>
                          ) : (
                            <Button 
                              size="xs" 
                              variant="outline" 
                              className="gap-1.5 py-1 px-2.5 h-auto text-[10px] font-black uppercase tracking-tighter border-2"
                              onClick={() => setAssigningId(order.orderId)}
                            >
                              <Truck size={12} />
                              Gán Shipper
                            </Button>
                          )}
                        </div>
                      )}
                      <button 
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-medium">
              Không có đơn hàng nào
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
