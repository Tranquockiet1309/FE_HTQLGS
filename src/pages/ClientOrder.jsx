import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  List, 
  Calendar, 
  Clock, 
  WashingMachine, 
  Waves, 
  CircleDot, 
  Footprints, 
  Banknote, 
  Landmark, 
  Wallet,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../components/ui';
import { Card, Badge } from '../components/ui';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-hot-toast';

export const ClientOrder = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [weight, setWeight] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    customerId: null,
    fullName: '',
    phone: '',
    address: ''
  });

  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('10:00');

  React.useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([
        fetchServices(),
        fetchUserInfo()
      ]);
      setLoading(false);
    };
    initPage();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await authService.getMe();
      console.log("response", response);
      if (response.success) {
        setCustomerInfo({
          userId: response.data.userId || null,
          customerId: response.data.customerId || null,
          fullName: response.data.fullName || '',
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await productService.getAll(true); // Get only active services
      console.log("response", response);
      setServices(response.data || []);
      if (response.data?.length > 0) {
        setSelectedService(response.data[0].serviceId);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ");
    }
  };

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const dateStr = appointmentDate || new Date().toISOString().split('T')[0];
      const timeStr = appointmentTime || '10:00';
      const promisedAt = new Date(`${dateStr}T${timeStr}:00`);

      const orderData = {
        customerId: customerInfo.userId,
        receiveMethod: "DELIVERY",
        promisedAt: isNaN(promisedAt.getTime()) ? null : promisedAt.toISOString(),
        orderNote: `Địa chỉ: ${customerInfo.address} | SĐT: ${customerInfo.phone} | Khách: ${customerInfo.fullName}`,
        items: [
          {
            serviceId: selectedService,
            quantity: weight,
            itemDescription: "Đơn hàng đặt từ Client Page"
          }
        ]
      };
      console.log("orderData", orderData);
      const response = await orderService.create(orderData);
      
      if (paymentMethod === 'ewallet' && response.data) {
        toast.success("Đặt hàng thành công, đang chuyển hướng sang VNPay...");
        try {
          const vnpayRequest = {
            orderId: response.data.orderId,
            amount: response.data.totalAmount, // Assuming the backend returns totalAmount
            orderDescription: `Thanh toán đơn hàng #${response.data.orderId}`
          };
          
          // Import paymentService dynamically or make sure it's imported at the top
          const vnPayResponse = await paymentService.createVnPayUrl(vnpayRequest);
          if (vnPayResponse.success && vnPayResponse.data) {
             window.location.href = vnPayResponse.data; // Redirect to VNPay
             return;
          } else {
             toast.error("Không thể tạo URL thanh toán VNPay");
          }
        } catch (paymentError) {
          console.error("Payment error:", paymentError);
          toast.error("Lỗi khi kết nối đến VNPay, nhưng đơn hàng đã được tạo.");
        }
      } else {
        toast.success("Đặt hàng thành công!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const payments = [
    { id: 'cash', name: 'Tiền mặt', icon: Banknote },
    { id: 'transfer', name: 'Chuyển khoản', icon: Landmark },
    { id: 'ewallet', name: 'Ví điện tử', icon: Wallet, extra: 'MoMo/VNPAY' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase">ĐẶT ĐƠN HÀNG MỚI</h2>
        <div className="h-1.5 w-20 bg-sky-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address & Contact */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-sky-500" size={18} />
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Địa chỉ Nhận và Giao đồ</h3>
            </div>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none h-24"
              placeholder="Nhập địa chỉ của bạn..."
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="flex items-center justify-center gap-2 py-2 px-3 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg text-[11px] font-bold hover:bg-sky-100 transition-all">
                <Navigation size={14} />
                Dùng vị trí hiện tại
              </button>
              <button className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-700">
                <List size={14} />
                Chọn từ Danh sách
              </button>
            </div>
          </Card>

          <Card className="border-none shadow-sm dark:bg-slate-900">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Thông tin Liên hệ</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tên Khách hàng</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500" 
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số Điện thoại</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500" 
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số Điện thoại phụ</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-500" defaultValue="0123 456 789" />
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm dark:bg-slate-900">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Lịch hẹn Nhận đồ</h3>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all" 
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="col-span-2 relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input 
                  type="time" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all" 
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Center Column: Services & Weight */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <Card className="border-none shadow-sm dark:bg-slate-900">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6">Chọn Dịch vụ & Khối lượng</h3>
            <div className="grid grid-cols-4 gap-3">
              {loading ? (
                <div className="col-span-4 py-8 text-center text-slate-400">Đang tải dịch vụ...</div>
              ) : services.map((s) => (
                <button 
                   key={s.serviceId}
                   onClick={() => setSelectedService(s.serviceId)}
                   className={cn(
                     "flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all group",
                     selectedService === s.serviceId 
                       ? "border-sky-500 bg-sky-50" 
                       : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                   )}
                 >
                   <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-sky-100 text-sky-600")}>
                     <WashingMachine size={24} />
                   </div>
                   <span className={cn("text-[11px] font-black uppercase tracking-tight text-center leading-tight h-8 flex items-center", selectedService === s.serviceId ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                     {s.serviceName}
                   </span>
                 </button>
              ))}
            </div>


            <div className="mt-10 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Khối lượng Ước tính</h4>
                <Badge variant="info">{weight} kg</Badge>
              </div>
              
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="1"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between mt-2 px-1">
                  {[5, 10, 15, 20, 25].map(v => (
                    <span key={v} className="text-[10px] font-bold text-slate-400">{v}kg</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[5, 10, 15, 20, 25].map(v => (
                  <button 
                    key={v}
                    onClick={() => setWeight(v)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold transition-all",
                      weight === v 
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {v}kg
                  </button>
                ))}
                <div className="relative">
                  <input type="text" placeholder="Ước tính" className="w-full h-full py-2 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] text-center outline-none focus:ring-1 focus:ring-sky-500" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm dark:bg-slate-900">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 font-bold">Thêm Ghi chú</h3>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none h-32"
              placeholder="Ví dụ: Giặt riêng đồ trắng, không dùng nước xả vải..."
            />
          </Card>
        </motion.div>

        {/* Right Column: Summary & Payment */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-3 space-y-6"
        >
          <Card className="border-none shadow-sm dark:bg-slate-900 bg-slate-50/50">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Tóm tắt Đơn hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Dịch vụ</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {services.find(s => s.serviceId === selectedService)?.serviceName || 'Dịch vụ'} - {weight}kg
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Đơn giá</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(services.find(s => s.serviceId === selectedService)?.unitPrice || 0).toLocaleString()}đ/{services.find(s => s.serviceId === selectedService)?.unit || 'kg'}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng cộng ước tính</span>
                <span className="text-2xl font-black text-sky-600">
                  {((services.find(s => s.serviceId === selectedService)?.unitPrice || 0) * weight).toLocaleString()}đ
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-white dark:bg-slate-800/50 p-2 rounded-lg mt-2">
                <Info size={12} />
                <span>Thời gian: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm dark:bg-slate-900">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Thanh toán</h3>
            <div className="grid grid-cols-1 gap-2">
              {payments.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                    paymentMethod === p.id 
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" 
                      : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
                    paymentMethod === p.id ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                  )}>
                    <p.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-xs font-bold", paymentMethod === p.id ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                      {p.name}
                    </p>
                    {p.extra && <p className="text-[10px] text-slate-400">{p.extra}</p>}
                  </div>
                  {paymentMethod === p.id && <div className="w-2 h-2 rounded-full bg-sky-500"></div>}
                </button>
              ))}
            </div>
          </Card>

          <button 
            onClick={handleCreateOrder}
            disabled={submitting || !selectedService}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-lg shadow-sky-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            {submitting ? 'ĐANG XỬ LÝ...' : 'TIẾN HÀNH ĐẶT HÀNG'}
            {!submitting && <ChevronRight className="group-hover:translate-x-1 transition-transform" />}
          </button>

        </motion.div>
      </div>
    </div>
  );
};
