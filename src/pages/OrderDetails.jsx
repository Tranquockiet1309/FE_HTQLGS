import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  RotateCcw, 
  Wind, 
  History, 
  PackageCheck, 
  Handshake,
  CheckCircle2,
  ChevronRight,
  User,
  CreditCard,
  DollarSign,
  Truck,
  PlusCircle,
  X,
  Image as ImageIcon,
  ExternalLink,
  Tag,
  FileText
} from 'lucide-react';
import { Card, Button, Badge, Modal, cn } from '../components/ui';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { deliveryService } from '../services/deliveryService';
import { toast } from 'react-hot-toast';
import QRLabel from '../components/QRLabel';
import InvoicePDF from '../components/InvoicePDF';

const steps = [
  { id: 1, title: "Laundry Bag", status: "Pending", icon: ShoppingBag, color: "amber" },
  { id: 2, title: "Washing", status: "Washing", icon: RotateCcw, color: "blue" },
  { id: 3, title: "Drying", status: "Drying", icon: Wind, color: "sky" },
  { id: 4, title: "Ironing", status: "Ironing", icon: History, color: "indigo" },
  { id: 5, title: "Completed", status: "Completed", icon: PackageCheck, color: "emerald" },
  { id: 6, title: "Delivered", status: "Delivered", icon: Handshake, color: "rose" },
];

const StepIcon = ({ icon: Icon, color, isActive, isCompleted, title, status }) => (
  <div className={cn(
    "relative flex flex-col items-center gap-3 z-10",
    isActive ? "opacity-100 scale-110" : isCompleted ? "opacity-100" : "opacity-40 grayscale transition-all duration-500"
  )}>
    <div className={cn(
      "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform",
      isActive ? `bg-${color}-500 text-white ring-4 ring-${color}-500/20` : isCompleted ? `bg-${color}-100 text-${color}-600 border-2 border-${color}-500` : "bg-white dark:bg-slate-800 text-slate-400"
    )}>
      <Icon size={28} />
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
          <CheckCircle2 size={14} />
        </div>
      )}
    </div>
    <div className="text-center">
      <p className="text-xs font-black uppercase tracking-tighter">{title}</p>
      <Badge variant={isActive ? (color === 'amber' ? 'warning' : color === 'emerald' ? 'success' : 'info') : isCompleted ? 'success' : 'default'}>
        {status}
      </Badge>
    </div>
  </div>
);

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippers, setShippers] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShipperModalOpen, setIsShipperModalOpen] = useState(false);
  const [isQRLabelOpen, setIsQRLabelOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    if (!id) {
      toast.error("Vui lòng chọn một đơn hàng để xem");
      navigate('/admin/dashboard');
      return;
    }
    fetchOrderDetails();
    fetchPayments();
    fetchShippers();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      if (response.success) {
        setOrder(response.data);
        setPaymentAmount(response.data.totalAmount - response.data.paidAmount);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin đơn hàng");
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getByOrder(id);
      if (response.success) setPayments(response.data);
    } catch (err) {}
  };

  const fetchShippers = async () => {
    try {
      const response = await deliveryService.getShippers();
      if (response.success) setShippers(response.data);
    } catch (err) {}
  };

  const handleUpdateStatus = async (status) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success(`Đã cập nhật trạng thái: ${status}`);
      setIsStatusModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleAddPayment = async () => {
    try {
      await paymentService.create({
        orderId: id,
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod,
        referenceNumber: ""
      });
      toast.success("Đã ghi nhận thanh toán");
      setIsPaymentModalOpen(false);
      fetchOrderDetails();
      fetchPayments();
    } catch (err) {
      toast.error("Lỗi khi tạo thanh toán");
    }
  };

  const handleAssignShipper = async (shipperId) => {
    try {
      await deliveryService.assignShipper(id, shipperId);
      toast.success("Đã gán shipper thành công");
      setIsShipperModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      toast.error("Lỗi khi gán shipper");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) return null;

  console.log("Current Order Data:", order);
  const proof = order.deliveryProof || order.DeliveryProof;

  const currentStepInfo = steps.find(s => s.status.toLowerCase() === order.status.toLowerCase()) || steps[0];
  const currentStep = currentStepInfo.id;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 mb-12">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
        <span className="hover:text-primary-500 cursor-pointer transition-colors" onClick={() => navigate('/admin/dashboard')}>Orders</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 dark:text-white">Order {order.orderCode}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black tracking-tighter">Order · {order.orderCode}</h2>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => setIsQRLabelOpen(true)}>
            <Tag size={18} />
            In nhãn QR
          </Button>
          <Button variant="outline" className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => setIsInvoiceOpen(true)}>
            <FileText size={18} />
            Hóa đơn
          </Button>
          {order.status === 'Completed' && (
            <Button variant="outline" className="gap-2 border-sky-500 text-sky-600 hover:bg-sky-50" onClick={() => setIsShipperModalOpen(true)}>
              <Truck size={18} />
              Gán Shipper
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => setIsStatusModalOpen(true)}>
            <RotateCcw size={18} />
            Cập nhật TT
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsPaymentModalOpen(true)}>
            <DollarSign size={18} />
            Thanh toán
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden py-12 px-8">
        <div className="absolute top-1/2 left-12 right-12 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-[4.5rem]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep - 1) * 20}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-primary-500 to-sky-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
        </div>

        <div className="relative flex justify-between gap-4">
          {steps.map((step) => (
            <StepIcon 
              key={step.id} 
              {...step} 
              isActive={currentStep === step.id} 
              isCompleted={currentStep > step.id} 
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white">Khách hàng</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Info</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tên HT</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Ngày nhận</span>
              <span className="font-bold">{new Date(order.receivedAt).toLocaleDateString('vi-VN')}</span>
            </div>
            {order.shipperId && (
              <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-900/20 p-2 rounded-lg border border-sky-100 dark:border-sky-800">
                <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-2">
                  <Truck size={14} /> Shipper
                </span>
                <span className="font-bold text-sky-700 dark:text-sky-300">
                  {shippers.find(s => s.shipperId === order.shipperId)?.name || 'Đã gán'}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <span className="text-slate-500 font-medium">Trạng thái</span>
              <Badge variant={
                order.status === 'Completed' ? 'success' : 
                order.status === 'Delivered' ? 'secondary' :
                ['Washing', 'Drying', 'Ironing'].includes(order.status) ? 'info' : 'warning'
              }>
                {order.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white">Thanh toán</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment details</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tổng tiền</span>
              <span className="font-bold text-lg">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Đã trả</span>
              <span className="font-bold text-emerald-600">{order.paidAmount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <span className="text-slate-500 font-medium">Trạng thái TT</span>
              <Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'UNPAID' ? 'warning' : 'info'}>
                {order.paymentStatus || 'CHƯA TRẢ'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white">Dịch vụ</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order items</p>
            </div>
          </div>
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[200px]">
             {order.items?.length === 0 && (
                <div className="py-4 text-center text-slate-400 font-medium">Không có dịch vụ</div>
             )}
             {order.items?.map((item) => (
                <div key={item.orderItemId} className="py-2 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-sm">{item.serviceName}</h5>
                    <p className="text-xs text-slate-500">{item.quantity} x {item.unitPrice.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <span className="font-bold text-sky-600">{item.lineAmount.toLocaleString('vi-VN')}đ</span>
                </div>
             ))}
          </div>
        </Card>
      </div>

      {/* Delivery Proof Section */}
      {proof && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="overflow-hidden p-0">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-64 md:h-auto bg-slate-100 dark:bg-slate-800 relative group overflow-hidden">
                        <img 
                            src={`http://10.137.117.170:5065${proof.imageUrl}`} 
                            alt="Bằng chứng giao hàng" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                            onClick={() => window.open(`http://10.137.117.170:5065${proof.imageUrl}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="text-white" size={32} />
                        </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Bằng chứng giao hàng</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery Evidence</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Thời gian giao</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">
                                    {new Date(proof.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái xác thực</p>
                                <div className="flex items-center gap-2 text-emerald-600 font-black">
                                    <CheckCircle2 size={18} />
                                    <span>Hợp lệ</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            * Ảnh này được chụp trực tiếp bởi Shipper tại thời điểm giao hàng để làm bằng chứng xác thực.
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
      )}

      {/* Modals */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Cập nhật Trạng thái">
        <div className="grid grid-cols-2 gap-3">
          {steps.map((step) => (
            <button 
              key={step.id}
              onClick={() => handleUpdateStatus(step.status)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                order.status === step.status 
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                  : "border-slate-100 dark:border-slate-800 hover:border-primary-200"
              )}
            >
              <div className={`p-2 rounded-lg bg-${step.color}-100 text-${step.color}-600`}>
                <step.icon size={20} />
              </div>
              <span className="font-bold text-sm">{step.status}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Ghi nhận Thanh toán">
        <form onSubmit={(e) => { e.preventDefault(); handleAddPayment(); }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Số tiền (đ)</label>
            <input 
              type="number" 
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 font-black text-xl text-emerald-600 outline-none focus:border-emerald-500 transition-all"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phương thức</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 font-bold outline-none focus:border-emerald-500 transition-all"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">Chuyển khoản</option>
              <option value="E-WALLET">Ví điện tử</option>
            </select>
          </div>
          <Button type="submit" className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 mt-4">Xác nhận Thanh toán</Button>
        </form>
      </Modal>

      <Modal isOpen={isShipperModalOpen} onClose={() => setIsShipperModalOpen(false)} title="Gán Shipper Giao hàng">
        <div className="space-y-3">
          {shippers.length === 0 ? (
            <p className="text-center py-8 text-slate-400">Không có shipper khả dụng</p>
          ) : (
            shippers.map((s) => (
              <button 
                key={s.shipperId}
                onClick={() => handleAssignShipper(s.shipperId)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-2xl border-2 border-transparent hover:border-sky-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 dark:text-white group-hover:text-sky-600 transition-colors">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.phone}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* QR Label Modal */}
      {isQRLabelOpen && (
        <QRLabel order={order} onClose={() => setIsQRLabelOpen(false)} />
      )}

      {/* Invoice PDF Modal */}
      {isInvoiceOpen && (
        <InvoicePDF order={order} payments={payments} onClose={() => setIsInvoiceOpen(false)} />
      )}
    </div>
  );
};
