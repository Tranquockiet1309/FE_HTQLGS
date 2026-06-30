import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Search, ChevronRight,
  FileSpreadsheet, Calendar, Download,
  Plus, User, WashingMachine, Weight, StickyNote, Store
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  Completed: 'success', Delivered: 'secondary',
  Washing: 'info', Drying: 'info', Ironing: 'info',
};

export const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  // Create Order Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderForm, setOrderForm] = useState({
    customerId: null,
    customerName: '',       // hiển thị tên khách đã chọn
    serviceId: null,
    weight: 5,
    receiveMethod: 'AT_STORE',
    orderNote: '',
    paymentMethod: 'cash',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      if (response.success) setOrders(response.data || []);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Tải customers + services khi mở modal
  const openCreateModal = async () => {
    setIsCreateOpen(true);
    try {
      const [custRes, svcRes] = await Promise.all([
        customerService.getAll(),
        productService.getAll(true),
      ]);
      setCustomers(custRes.data || []);
      setServices(svcRes.data || []);
      if (svcRes.data?.length > 0) {
        setOrderForm(f => ({ ...f, serviceId: svcRes.data[0].serviceId }));
      }
    } catch {
      toast.error('Không thể tải dữ liệu');
    }
  };

  const handleCreateOrder = async () => {
    if (!orderForm.customerId) { toast.error('Vui lòng chọn khách hàng'); return; }
    if (!orderForm.serviceId)  { toast.error('Vui lòng chọn dịch vụ'); return; }
    if (orderForm.weight < 1)  { toast.error('Khối lượng tối thiểu là 1 kg'); return; }

    setCreating(true);
    try {
      await orderService.create({
        customerId: orderForm.customerId,
        receiveMethod: orderForm.receiveMethod,
        orderNote: `[ĐƠN THỦ CÔNG] KH: ${orderForm.customerName} | ${orderForm.orderNote}`,
        items: [{ serviceId: orderForm.serviceId, quantity: orderForm.weight, itemDescription: 'Tạo thủ công tại quầy' }],
        redeemedPoints: 0,
      });
      toast.success('Tạo đơn hàng thành công! 🎉');
      setIsCreateOpen(false);
      setOrderForm({ customerId: null, customerName: '', serviceId: services[0]?.serviceId || null, weight: 5, receiveMethod: 'AT_STORE', orderNote: '', paymentMethod: 'cash' });
      setCustomerSearch('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setCreating(false);
    }
  };

  const filteredOrders = orders.filter(
    o =>
      o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const response = await fetch(`/api/v1/reports/revenue/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Xuất thất bại');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `BaoCaoDoanhThu_${fromDate}_${toDate}.xlsx`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      toast.success('Xuất Excel thành công!');
    } catch {
      toast.error('Không thể xuất file Excel');
    } finally {
      setExportLoading(false);
    }
  };

  // Danh sách khách hàng lọc theo search
  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // Dịch vụ đang chọn
  const selectedService = services.find(s => s.serviceId === orderForm.serviceId);
  const estimatedTotal = (selectedService?.unitPrice || 0) * orderForm.weight;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Đơn hàng</h2>
          <p className="text-slate-500 font-medium">
            {filteredOrders.length} đơn hàng{searchTerm ? ' (đang lọc)' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus size={18} /> Tạo đơn thủ công
          </Button>
        </div>
      </div>

      {/* Export Excel Card */}
      <Card className="border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-black text-slate-800 dark:text-white text-sm">Xuất báo cáo doanh thu</p>
              <p className="text-xs text-slate-500">Chọn khoảng thời gian và tải file Excel</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <Calendar size={14} className="text-slate-400" />
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="text-xs outline-none bg-transparent dark:text-white" />
            </div>
            <span className="text-slate-400 text-xs">—</span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <Calendar size={14} className="text-slate-400" />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="text-xs outline-none bg-transparent dark:text-white" />
            </div>
            <button onClick={handleExportExcel} disabled={exportLoading} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
              <Download size={14} />
              {exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/10 border-2 border-slate-100 dark:border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-sky-500/50 transition-all dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Trang {currentPage}/{totalPages || 1}</span>
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
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        {searchTerm ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map(order => (
                      <tr key={order.orderId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders/${order.orderId}`)}>
                        <td className="px-6 py-4 font-bold text-sky-600 dark:text-sky-400">{order.orderCode}</td>
                        <td className="px-6 py-4 font-medium">{order.customerName}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={STATUS_COLORS[order.status] || 'warning'}>{order.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                            {order.paymentStatus || 'CHƯA TRẢ'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(order.receivedAt).toLocaleString('vi-VN')}</td>
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
            <div className="border-t border-slate-100 dark:border-slate-800 px-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredOrders.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </Card>

      {/* ── Create Order Modal ── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tạo Đơn hàng thủ công">
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl px-4 py-2.5">
            <Store size={14} className="text-sky-500 flex-shrink-0" />
            <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
              Dành cho khách mang đồ trực tiếp đến tiệm — nhân viên nhập thay khách hàng.
            </p>
          </div>

          {/* ── 2 cột ngang ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* CỘT TRÁI: Khách hàng */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Khách hàng <span className="text-rose-500">*</span>
              </label>
              {orderForm.customerId ? (
                <div className="flex items-center justify-between bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-300 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-sky-600" />
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{orderForm.customerName}</p>
                  </div>
                  <button onClick={() => setOrderForm(f => ({ ...f, customerId: null, customerName: '' }))} className="text-xs text-rose-500 font-bold hover:underline">Đổi</button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc SĐT..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-xs"
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    {filteredCustomers.slice(0, 8).map(c => (
                      <button
                        key={c.customerId}
                        onClick={() => { setOrderForm(f => ({ ...f, customerId: c.customerId, customerName: c.fullName })); setCustomerSearch(''); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <User size={11} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-xs">{c.fullName}</p>
                          <p className="text-[10px] text-slate-400">{c.phone}</p>
                        </div>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <p className="px-3 py-3 text-xs text-slate-400 text-center">Không tìm thấy</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: Dịch vụ + Khối lượng + Ghi chú + Tóm tắt */}
            <div className="space-y-3">
              {/* Dịch vụ */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Dịch vụ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {services.map(s => (
                    <button
                      key={s.serviceId}
                      onClick={() => setOrderForm(f => ({ ...f, serviceId: s.serviceId }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all text-left ${
                        orderForm.serviceId === s.serviceId
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300'
                          : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <WashingMachine size={13} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black truncate">{s.serviceName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{s.unitPrice?.toLocaleString('vi-VN')}đ/{s.unit || 'kg'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Khối lượng */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1"><Weight size={11} /> Khối lượng</span>
                  <span className="font-black text-sky-600 text-sm">{orderForm.weight} kg</span>
                </label>
                <input
                  type="range" min="1" max="30" step="1"
                  value={orderForm.weight}
                  onChange={e => setOrderForm(f => ({ ...f, weight: parseInt(e.target.value) }))}
                  className="w-full accent-sky-500"
                />
                <div className="flex gap-1.5">
                  {[2, 5, 10, 15, 20].map(v => (
                    <button key={v} onClick={() => setOrderForm(f => ({ ...f, weight: v }))}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${orderForm.weight === v ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                    >{v}kg</button>
                  ))}
                </div>
              </div>

              {/* Ghi chú */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <StickyNote size={11} /> Ghi chú
                </label>
                <textarea
                  rows={2}
                  placeholder="Giặt riêng đồ trắng, không nước xả..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all text-xs resize-none"
                  value={orderForm.orderNote}
                  onChange={e => setOrderForm(f => ({ ...f, orderNote: e.target.value }))}
                />
              </div>

              {/* Tổng tiền */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Tổng ước tính</span>
                <span className="text-lg font-black text-sky-600">{estimatedTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Hủy</button>
            <Button className="flex-1 h-11 text-sm gap-2" disabled={creating || !orderForm.customerId || !orderForm.serviceId} onClick={handleCreateOrder}>
              {creating ? 'Đang tạo...' : <><ShoppingBag size={15} /> Tạo đơn hàng</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
