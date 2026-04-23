import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Tag } from 'lucide-react';

const QRLabel = ({ order, onClose }) => {
  const printRef = useRef(null);

  if (!order) return null;

  const qrData = JSON.stringify({
    code: order.orderCode,
    customer: order.customerName,
    phone: order.customerPhone || '',
    services: order.items?.map(i => i.serviceName).join(', ') || '',
    promised: order.promisedAt ? new Date(order.promisedAt).toLocaleDateString('vi-VN') : 'N/A',
  });

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=420,height=600');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Nhãn đơn ${order.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; background: #fff; }
          .label-wrapper { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; }
          .label {
            width: 180px; border: 2px dashed #1e40af;
            border-radius: 10px; padding: 10px;
            text-align: center; page-break-inside: avoid;
            background: #fff;
          }
          .label-header {
            background: #1e40af; color: #fff;
            border-radius: 6px; padding: 4px 6px;
            font-size: 11px; font-weight: 900;
            letter-spacing: 1px; margin-bottom: 8px;
          }
          .label h2 { font-size: 13px; font-weight: 900; margin: 6px 0 2px; color: #1e293b; }
          .label p { font-size: 10px; color: #475569; margin: 2px 0; }
          .label .phone { font-size: 11px; font-weight: 700; color: #0f172a; }
          .label .service { font-size: 9px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
          .label .promised { font-size: 10px; font-weight: 700; color: #dc2626; margin-top: 4px; }
          svg { margin: 6px auto; display: block; }
          @media print {
            body { margin: 0; }
            .label-wrapper { padding: 8px; gap: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="label-wrapper">${printContent}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // Build one label HTML block (3 copies)
  const labelHtml = `
    <div class="label">
      <div class="label-header">🧺 TIỆM GIẶT SẤY</div>
      <div style="text-align:center">
        ${printRef.current ? '' : ''}
      </div>
      <h2>${order.orderCode}</h2>
      <p>${order.customerName || 'N/A'}</p>
      <p class="phone">${order.customerPhone || ''}</p>
      <p class="service">${order.items?.map(i => i.serviceName).join(' · ') || 'N/A'}</p>
      <p class="promised">Hẹn: ${order.promisedAt ? new Date(order.promisedAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
    </div>
  `;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white">Nhãn QR đơn hàng</h3>
              <p className="text-xs text-slate-400 font-medium">In & dán vào túi đựng đồ</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div className="flex gap-4 justify-center flex-wrap" ref={printRef}>
            {[1, 2, 3].map((copy) => (
              <div key={copy} className="w-[170px] border-2 border-dashed border-blue-500 rounded-2xl p-3 text-center bg-white shadow-sm">
                <div className="bg-blue-700 text-white text-[10px] font-black tracking-widest uppercase rounded-lg px-2 py-1 mb-2">
                  🧺 TIỆM GIẶT SẤY
                </div>
                <QRCodeSVG
                  value={qrData}
                  size={100}
                  level="M"
                  includeMargin={false}
                  className="mx-auto"
                />
                <p className="text-[13px] font-black text-slate-900 mt-2">{order.orderCode}</p>
                <p className="text-[11px] font-bold text-slate-700">{order.customerName}</p>
                {order.customerPhone && (
                  <p className="text-[11px] font-bold text-blue-700">{order.customerPhone}</p>
                )}
                <div className="border-t border-slate-200 mt-2 pt-1">
                  <p className="text-[9px] text-slate-500 leading-tight">
                    {order.items?.map(i => i.serviceName).join(' · ') || 'N/A'}
                  </p>
                  <p className="text-[10px] font-black text-red-600 mt-1">
                    Hẹn: {order.promisedAt ? new Date(order.promisedAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">In 3 nhãn — dán vào túi, móc quần áo, phiếu gửi</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
          >
            <Printer size={18} />
            In nhãn (3 bản)
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRLabel;
