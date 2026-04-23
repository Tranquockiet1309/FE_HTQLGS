import React, { useRef, useState } from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoicePDF = ({ order, payments, onClose }) => {
  const invoiceRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  if (!order) return null;

  const now = new Date();
  const invoiceNumber = `HD-${order.orderCode}`;

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Export PDF failed', err);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    const content = invoiceRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>${invoiceNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',sans-serif; color:#1e293b; padding:24px; font-size:13px; }
        .inv-header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1e40af; padding-bottom:16px; margin-bottom:16px; }
        .inv-shop h1 { font-size:20px; font-weight:900; color:#1e40af; }
        .inv-shop p { font-size:11px; color:#64748b; margin-top:2px; }
        .inv-meta { text-align:right; }
        .inv-meta h2 { font-size:16px; font-weight:900; color:#1e293b; }
        .inv-meta p { font-size:11px; color:#64748b; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
        .info-box h4 { font-size:10px; font-weight:900; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
        .info-box p { font-size:12px; color:#1e293b; font-weight:600; margin:2px 0; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        thead th { background:#1e40af; color:white; padding:8px 10px; font-size:11px; font-weight:700; text-align:left; }
        tbody td { padding:8px 10px; font-size:12px; border-bottom:1px solid #f1f5f9; }
        tbody tr:last-child td { border:none; }
        .total-box { background:#f0f9ff; border:2px solid #1e40af; border-radius:8px; padding:12px 16px; max-width:260px; margin-left:auto; }
        .total-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; }
        .total-row.grand { font-size:15px; font-weight:900; color:#1e40af; border-top:2px solid #bfdbfe; padding-top:8px; margin-top:4px; }
        .pay-status { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; }
        .paid { background:#dcfce7; color:#166534; }
        .unpaid { background:#fef9c3; color:#854d0e; }
        .footer { text-align:center; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:12px; margin-top:16px; }
        @media print { body { padding:16px; } }
      </style>
      </head><body>${content}
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white">Hóa đơn thanh toán</h3>
              <p className="text-xs text-slate-400 font-medium">{invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="overflow-y-auto flex-1 p-6">
          <div ref={invoiceRef} className="bg-white text-slate-800 p-8 rounded-2xl border border-slate-200 text-sm font-['Segoe_UI',sans-serif]" style={{ minWidth: 520 }}>
            {/* Shop Header */}
            <div className="inv-header flex justify-between items-start border-b-2 border-blue-800 pb-4 mb-4">
              <div className="inv-shop">
                <h1 className="text-xl font-black text-blue-800">🧺 TIỆM GIẶT SẤY</h1>
                <p className="text-xs text-slate-500 mt-1">Chất lượng — Nhanh chóng — Uy tín</p>
                <p className="text-xs text-slate-400">ĐT: 0909 xxx xxx | Địa chỉ: TP. HCM</p>
              </div>
              <div className="inv-meta text-right">
                <h2 className="text-base font-black text-slate-800 uppercase tracking-widest">Hóa Đơn</h2>
                <p className="text-xs text-slate-500 mt-1">Số: <strong>{invoiceNumber}</strong></p>
                <p className="text-xs text-slate-500">Ngày: {now.toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="info-grid grid grid-cols-2 gap-4 mb-4">
              <div className="info-box bg-slate-50 border border-slate-200 rounded-xl p-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Khách hàng</h4>
                <p className="text-sm font-bold text-slate-800">{order.customerName || 'N/A'}</p>
                <p className="text-xs text-slate-500">{order.customerPhone || ''}</p>
                <p className="text-xs text-slate-500">{order.customerAddress || ''}</p>
              </div>
              <div className="info-box bg-slate-50 border border-slate-200 rounded-xl p-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thông tin đơn</h4>
                <p className="text-xs text-slate-600">Mã đơn: <strong className="text-slate-800">{order.orderCode}</strong></p>
                <p className="text-xs text-slate-600">Nhận: {new Date(order.receivedAt).toLocaleDateString('vi-VN')}</p>
                {order.promisedAt && (
                  <p className="text-xs text-slate-600">Hẹn trả: <strong className="text-red-600">{new Date(order.promisedAt).toLocaleDateString('vi-VN')}</strong></p>
                )}
                <p className="text-xs text-slate-600">Hình thức: {order.receiveMethod === 'AT_STORE' ? 'Tại cửa hàng' : 'Giao hàng'}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="py-2 px-3 text-left text-xs font-bold rounded-l-lg">#</th>
                  <th className="py-2 px-3 text-left text-xs font-bold">Dịch vụ</th>
                  <th className="py-2 px-3 text-right text-xs font-bold">SL</th>
                  <th className="py-2 px-3 text-right text-xs font-bold">Đơn giá</th>
                  <th className="py-2 px-3 text-right text-xs font-bold rounded-r-lg">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={item.orderItemId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-2 px-3 text-xs text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-xs font-semibold text-slate-800">{item.serviceName}</td>
                    <td className="py-2 px-3 text-xs text-right text-slate-600">{item.quantity}</td>
                    <td className="py-2 px-3 text-xs text-right text-slate-600">{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                    <td className="py-2 px-3 text-xs text-right font-bold text-blue-700">{item.lineAmount.toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <tr><td colSpan={5} className="py-4 text-center text-xs text-slate-400">Không có dịch vụ</td></tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 w-64">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{order.subtotalAmount?.toLocaleString('vi-VN')}đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-700 mb-1">
                    <span>Giảm giá</span>
                    <span className="font-semibold">-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Phí giao hàng</span>
                    <span className="font-semibold">{order.deliveryFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-blue-800 border-t-2 border-blue-200 pt-2 mt-2">
                  <span>TỔNG CỘNG</span>
                  <span>{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700 mt-1">
                  <span>Đã thanh toán</span>
                  <span className="font-bold">{order.paidAmount?.toLocaleString('vi-VN')}đ</span>
                </div>
                {(order.totalAmount - order.paidAmount) > 0 && (
                  <div className="flex justify-between text-xs text-red-600 mt-1 font-bold">
                    <span>Còn lại</span>
                    <span>{(order.totalAmount - order.paidAmount).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="mt-2 text-right">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus === 'PAID' ? '✓ ĐÃ THANH TOÁN' : '⏳ CHƯA THANH TOÁN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {payments && payments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lịch sử thanh toán</h4>
                <div className="space-y-1">
                  {payments.map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-600">{new Date(p.paidAt).toLocaleString('vi-VN')} — {p.paymentMethod}</span>
                      <span className="text-xs font-bold text-emerald-700">+{p.amount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {order.orderNote && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-amber-800"><strong>Ghi chú:</strong> {order.orderNote}</p>
              </div>
            )}

            {/* Footer */}
            <div className="footer text-center border-t border-slate-200 pt-4 mt-4">
              <p className="text-[11px] text-slate-500 italic">Cảm ơn quý khách đã sử dụng dịch vụ! Hẹn gặp lại 🙏</p>
              <p className="text-[10px] text-slate-400 mt-1">Hóa đơn được xuất tự động — {now.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-3 flex gap-3 shrink-0 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 h-12 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all"
          >
            🖨️ In hóa đơn
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-60"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {exporting ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
