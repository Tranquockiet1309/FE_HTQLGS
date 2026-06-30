import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Clock, CheckCircle, Truck, XCircle,
  ChevronDown, ChevronUp, WashingMachine, RefreshCw,
  ShoppingBag, CalendarDays
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  Pending:   { label: 'Chờ xử lý',     color: 'bg-amber-100 text-amber-700',  icon: Clock },
  Washing:   { label: 'Đang giặt',      color: 'bg-sky-100 text-sky-700',      icon: WashingMachine },
  Drying:    { label: 'Đang sấy',       color: 'bg-blue-100 text-blue-700',    icon: RefreshCw },
  Ironing:   { label: 'Đang ủi',        color: 'bg-violet-100 text-violet-700',icon: RefreshCw },
  Completed: { label: 'Hoàn thành',     color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  Shipped:   { label: 'Đang giao',      color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  Arrived:   { label: 'Đã đến nơi',    color: 'bg-teal-100 text-teal-700',    icon: Truck },
  Delivered: { label: 'Đã nhận hàng',  color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  Cancelled: { label: 'Đã hủy',        color: 'bg-rose-100 text-rose-700',    icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-slate-100 text-slate-600', icon: Package };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <ShoppingBag size={18} className="text-sky-600" />
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">
              {order.orderCode}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <CalendarDays size={11} />
              {new Date(order.receivedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {/* Tổng tiền — hiện tất cả màn hình */}
          <div className="text-right">
            <p className="text-xs text-slate-400">Tổng tiền</p>
            <p className="font-black text-sky-600 text-sm">
              {order.totalAmount?.toLocaleString('vi-VN')}đ
            </p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-4">
              {/* Items */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Dịch vụ</p>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <WashingMachine size={14} className="text-sky-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.serviceName}</span>
                        <span className="text-slate-400">×{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.lineAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment + Promised */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thanh toán</p>
                  <p className={`text-xs font-black mt-1 ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </p>
                </div>
                {order.promisedAt && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hẹn giao</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                      {new Date(order.promisedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery proof image — dùng relative URL qua Vite proxy */}
              {order.deliveryProof?.imageUrl && (
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Ảnh xác nhận giao hàng</p>
                  <img
                    src={order.deliveryProof.imageUrl}
                    alt="Ảnh giao hàng"
                    className="rounded-xl w-full max-h-48 object-cover border border-slate-200"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res.data || []);
      } catch {
        toast.error('Không thể tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const filterTabs = [
    { key: 'all',       label: 'Tất cả' },
    { key: 'Pending',   label: 'Chờ xử lý' },
    { key: 'Washing',   label: 'Đang giặt' },
    { key: 'Completed', label: 'Hoàn thành' },
    { key: 'Delivered', label: 'Đã nhận' },
    { key: 'Cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
          Lịch sử Đơn hàng
        </h2>
        <div className="h-1.5 w-20 bg-sky-500 rounded-full" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
              filter === tab.key
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-300'
            }`}
          >
            {tab.label}
            {tab.key === 'all' && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium">
            {filter === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng nào ở trạng thái này'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-sky-500 text-white text-sm font-black rounded-xl hover:bg-sky-600 transition-all"
            >
              Đặt đơn ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
