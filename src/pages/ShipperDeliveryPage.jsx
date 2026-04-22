import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/deliveryService';
import { authService } from '../services/authService';
import { Camera, Package, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const ShipperDeliveryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);
    const currentUser = authService.getCurrentUser();
    const [shipperId, setShipperId] = useState(currentUser?.userId || 1); 

    useEffect(() => {
        loadOrders();
    }, [shipperId]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await deliveryService.getAssignedOrders(shipperId);
            if (response.success) {
                setOrders(response.data);
            }
        } catch (err) {
            setError("Không thể tải danh sách đơn hàng");
            console.error(err);
        } finally {
            setLoading(false);
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
                // Remove order from list
                setOrders(orders.filter(o => o.orderId !== orderId));
                alert("Giao hàng thành công!");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi tải ảnh lên");
        } finally {
            setUploading(false);
            setSelectedOrder(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Đang tải đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-['Inter']">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Giao hàng
                </h1>
                <p className="text-slate-400 mt-1">Quản lý các đơn hàng cần giao của bạn</p>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid gap-4">
                {orders.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-2xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-300">Không có đơn hàng nào</h3>
                        <p className="text-slate-500 mt-2">Tất cả các đơn hàng đã được giao xong!</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.orderId} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl transition-all hover:border-blue-500/50 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-200">{order.orderCode}</h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{order.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                    Khách hàng: <span className="text-slate-200 font-medium">{order.customerName}</span>
                                </p>
                            </div>

                            <div className="relative">
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
                                    className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold transition-all cursor-pointer ${
                                        selectedOrder === order.orderId && uploading
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-900/20'
                                    }`}
                                >
                                    {selectedOrder === order.orderId && uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5" />
                                            Xác nhận giao hàng
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <footer className="mt-12 text-center text-slate-600 text-sm">
                <p>&copy; 2024 Laundry Management System</p>
            </footer>
        </div>
    );
};

export default ShipperDeliveryPage;
