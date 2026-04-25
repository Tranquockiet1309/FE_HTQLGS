import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Camera, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Clock,
  ChevronRight,
  LogOut,
  User,
  History,
  Truck,
  ImageIcon
} from 'lucide-react';
import { deliveryService } from '../services/deliveryService';
import { authService } from '../services/authService';
import { Button, Badge, Card, cn } from '../components/ui';
import toast from 'react-hot-toast';

const ShipperDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
    const [activeView, setActiveView] = useState('orders'); // 'orders', 'history', 'profile'
    
    const user = JSON.parse(localStorage.getItem('user'));
    const [arrivedOrders, setArrivedOrders] = useState(new Set());
    const shipperId = user?.shipperId;

    useEffect(() => {
        const checkUser = async () => {
            if (user && !user.shipperId) {
                try {
                    const res = await authService.getMe();
                    if (res.success) {
                        localStorage.setItem('user', JSON.stringify(res.data));
                        // Không reload toàn bộ trang nếu không cần thiết
                    }
                } catch (e) {
                    console.error("Refresh user failed", e);
                }
            }
        };
        checkUser();
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const [ordersRes, historyRes] = await Promise.all([
                deliveryService.getMyOrders(),
                deliveryService.getMyHistory()
            ]);
            
            if (ordersRes.success) setOrders(ordersRes.data || []);
            if (historyRes.success) setHistoryOrders(historyRes.data || []);
        } catch (err) {
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmArrival = async (orderId) => {
        try {
            await deliveryService.confirmArrival(orderId);
            setArrivedOrders(prev => new Set(prev).add(orderId));
            toast.success("Đã xác nhận đến điểm giao!");
            loadOrders();
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };

    const handleFileChange = async (e, orderId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setSelectedOrder(orderId);
        try {
            const response = await deliveryService.uploadProof(orderId, shipperId, file);
            if (response.success) {
                toast.success("Giao hàng thành công!");
                setArrivedOrders(prev => {
                    const next = new Set(prev);
                    next.delete(orderId);
                    return next;
                });
                loadOrders();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi tải ảnh lên");
        } finally {
            setUploading(false);
            setSelectedOrder(null);
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const stats = {
        pending: orders.filter(o => (o.status !== 'Delivered' && o.status !== 7) && (o.status !== 'Arrived' && o.status !== 6)).length,
        arrived: orders.filter(o => (o.status === 'Arrived' || o.status === 6)).length,
        today: historyOrders.filter(o => {
            const date = new Date(o.completedAt);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        }).length
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <p className="text-slate-500 font-bold animate-pulse">Đang đồng bộ dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-500">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 px-6 pt-8 pb-6 rounded-b-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-0 z-20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Truck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cấp bậc: Shipper</p>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                {user?.fullName || "Tài xế"}
                            </h1>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all active:scale-90"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/50">
                        <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-tighter mb-1">Đơn đang nhận</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{orders.length}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mb-1">Đã giao (Hôm nay)</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.today}</p>
                    </div>
                </div>
            </header>

            <main className="px-6 mt-6">
                <AnimatePresence mode='wait'>
                    {activeView === 'orders' && (
                        <motion.div 
                            key="orders"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Sub-tabs */}
                            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl">
                                <button 
                                    onClick={() => setActiveTab('pending')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all",
                                        activeTab === 'pending' 
                                        ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' 
                                        : 'text-slate-500'
                                    )}
                                >
                                    Chờ giao ({orders.filter(o => (o.status !== 'Arrived' && o.status !== 6)).length})
                                </button>
                                <button 
                                    onClick={() => setActiveTab('completed')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all",
                                        activeTab === 'completed' 
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' 
                                        : 'text-slate-500'
                                    )}
                                >
                                    Đã đến điểm ({orders.filter(o => (o.status === 'Arrived' || o.status === 6)).length})
                                </button>
                            </div>

                            <div className="space-y-4">
                                {orders.filter(o => activeTab === 'pending' ? (o.status !== 'Arrived' && o.status !== 6) : (o.status === 'Arrived' || o.status === 6)).length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package size={32} className="text-slate-300" />
                                        </div>
                                        <p className="font-bold text-slate-400 text-sm">Không có đơn hàng nào ở mục này</p>
                                    </div>
                                ) : (
                                    orders
                                    .filter(o => activeTab === 'pending' ? (o.status !== 'Arrived' && o.status !== 6) : (o.status === 'Arrived' || o.status === 6))
                                    .map((order) => (
                                        <Card key={order.orderId} className="p-0 overflow-hidden border-none shadow-lg shadow-slate-200/50 dark:shadow-none">
                                            <div className="p-5 border-b border-slate-50 dark:border-slate-800">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-slate-800 dark:text-white">#{order.orderCode}</h3>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={(order.status === 'Arrived' || order.status === 6) ? 'success' : 'primary'} className="text-[9px] px-2 py-0.5 font-black uppercase">
                                                        {(order.status === 'Arrived' || order.status === 6) ? 'Đã đến nơi' : 'Đang giao'}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                                            <User size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Khách hàng</p>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.customerName}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                                            <MapPin size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Địa chỉ giao</p>
                                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2">Cần Thơ, Việt Nam (Tọa độ GPS)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <button className="flex-1 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-200 active:scale-95 transition-all">
                                                        <Phone size={18} className="text-emerald-500" />
                                                        Gọi điện
                                                    </button>
                                                    
                                                    {((order.status === 'Arrived' || order.status === 6) || order.status === 6) && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex-1 relative"
                                                        >
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                capture="environment"
                                                                className="hidden"
                                                                id={`upload-${order.orderId}`}
                                                                onChange={(e) => handleFileChange(e, order.orderId)}
                                                                disabled={uploading}
                                                            />
                                                            <label
                                                                htmlFor={`upload-${order.orderId}`}
                                                                className={cn(
                                                                    "flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg active:scale-95",
                                                                    selectedOrder === order.orderId && uploading
                                                                    ? 'bg-slate-200 text-slate-400'
                                                                    : 'bg-primary-500 text-white shadow-primary-500/20'
                                                                )}
                                                            >
                                                                {selectedOrder === order.orderId && uploading ? (
                                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Camera size={18} />
                                                                        Chụp ảnh
                                                                    </>
                                                                )}
                                                            </label>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {(order.status !== 'Arrived' && order.status !== 6) && (
                                                    <div className="relative h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl p-1 overflow-hidden">
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                                Vuốt xác nhận đến nơi »
                                                            </p>
                                                        </div>
                                                        <motion.div
                                                            drag="x"
                                                            dragConstraints={{ left: 0, right: 230 }}
                                                            dragElastic={0}
                                                            onDragEnd={(e, info) => {
                                                                if (info.offset.x > 150) {
                                                                    handleConfirmArrival(order.orderId);
                                                                }
                                                            }}
                                                            className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10 relative"
                                                        >
                                                            <ChevronRight className="text-primary-500" />
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'history' && (
                        <motion.div 
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Lịch sử giao</h2>
                                <Badge variant="secondary" className="font-black">{historyOrders.length} đơn</Badge>
                            </div>

                            {historyOrders.length === 0 ? (
                                <div className="text-center py-20">
                                    <History size={48} className="text-slate-200 mx-auto mb-4" />
                                    <p className="font-bold text-slate-400">Chưa có dữ liệu lịch sử</p>
                                </div>
                            ) : (
                                historyOrders.map((order) => (
                                    <Card key={order.orderId} className="overflow-hidden border-none shadow-sm">
                                        <div className="flex p-4 gap-4">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 group relative">
                                                {order.deliveryProof?.imageUrl ? (
                                                    <img 
                                                        src={`http://10.137.117.170:5065${order.deliveryProof.imageUrl}`} 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                                        alt="Proof"
                                                        onClick={() => window.open(`http://10.137.117.170:5065${order.deliveryProof.imageUrl}`, '_blank')}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Camera size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-black text-slate-800 dark:text-white truncate">#{order.orderCode}</h3>
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-500 truncate mt-0.5">{order.customerName}</p>
                                                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    <Clock size={12} />
                                                    {new Date(order.completedAt).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeView === 'profile' && (
                        <motion.div 
                            key="profile"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="relative p-8 text-center bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/20 rounded-full -ml-16 -mb-16 blur-3xl"></div>
                                
                                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md mx-auto mb-4 flex items-center justify-center border border-white/20 shadow-inner">
                                    <User size={48} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-white leading-tight">{user?.fullName}</h2>
                                <Badge variant="primary" className="mt-2 bg-white/20 text-white border-none font-black px-3 py-1">ID: {user?.shipperId || 'SHIPPER'}</Badge>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Thông tin định danh</h3>
                                <Card className="space-y-5 p-6 border-none shadow-sm">
                                    {[
                                        { label: 'Họ và tên', value: user?.fullName, icon: User },
                                        { label: 'Số điện thoại', value: user?.phone || '0912 345 678', icon: Phone },
                                        { label: 'Khu vực hoạt động', value: 'Quận Ninh Kiều', icon: MapPin },
                                        { label: 'Loại phương tiện', value: 'Xe máy (Honda)', icon: Truck },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                                    <item.icon size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-500">{item.label}</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </Card>

                                <button 
                                    onClick={handleLogout}
                                    className="w-full h-16 rounded-2xl bg-rose-50 text-rose-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition-all active:scale-95"
                                >
                                    <LogOut size={20} />
                                    ĐĂNG XUẤT TÀI KHOẢN
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-8 left-8 right-8 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none flex items-center justify-around px-6 border border-white/20 z-30">
                {[
                    { id: 'orders', label: 'Giao hàng', icon: Truck },
                    { id: 'history', label: 'Lịch sử', icon: History },
                    { id: 'profile', label: 'Cá nhân', icon: User },
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-300",
                            activeView === item.id ? "text-primary-500 scale-110" : "text-slate-300 hover:text-slate-400"
                        )}
                    >
                        <item.icon size={activeView === item.id ? 28 : 24} />
                        <span className={cn("text-[9px] font-black uppercase tracking-tighter", activeView === item.id ? "opacity-100" : "opacity-0")}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ShipperDashboard;
