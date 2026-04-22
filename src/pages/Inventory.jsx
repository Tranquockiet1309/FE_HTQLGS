import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  Download
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { productService } from '../services/productService';
import { toast } from 'react-hot-toast';

export const Inventory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms State
  const [inForm, setInForm] = useState({ itemName: 'Soap', quantity: 0, unit: 'kg', unitCost: 0, referenceNote: '' });
  const [outForm, setOutForm] = useState({ itemName: 'Soap', quantity: 0, unit: 'kg', referenceNote: '' });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await productService.getInventory();
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải lịch sử kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStockIn = async () => {
    if (inForm.quantity <= 0) {
      toast.error('Số lượng nhập phải lớn hơn 0');
      return;
    }
    toast.loading('Đang xử lý nhập kho...', { id: 'stock' });
    try {
      await productService.createInventoryTxn({
        itemName: inForm.itemName,
        txnType: 'IN',
        quantity: parseFloat(inForm.quantity),
        unit: inForm.unit,
        unitCost: parseFloat(inForm.unitCost),
        referenceNote: inForm.referenceNote
      });
      toast.success('Nhập kho thành công!', { id: 'stock' });
      setInForm({ ...inForm, quantity: 0, unitCost: 0, referenceNote: '' });
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi xử lý', { id: 'stock' });
    }
  };

  const handleUsage = async () => {
    if (outForm.quantity <= 0) {
      toast.error('Số lượng xuất phải lớn hơn 0');
      return;
    }
    toast.loading('Đang xử lý xuất kho...', { id: 'stock' });
    try {
      await productService.createInventoryTxn({
        itemName: outForm.itemName,
        txnType: 'OUT',
        quantity: parseFloat(outForm.quantity),
        unit: outForm.unit,
        unitCost: null,
        referenceNote: outForm.referenceNote
      });
      toast.success('Log Usage thành công!', { id: 'stock' });
      setOutForm({ ...outForm, quantity: 0, referenceNote: '' });
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi xử lý', { id: 'stock' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Kho (Inventory)</h2>
          <p className="text-slate-500 font-medium">Theo dõi vật tư nhập xuất.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock In Card */}
        <Card className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-sky-600">Stock In (Nhập Kho)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Vật tư</label>
              <select 
                value={inForm.itemName} onChange={e => setInForm({...inForm, itemName: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-sky-500 font-bold transition-all"
              >
                <option value="Soap">Soap</option>
                <option value="Softener">Softener</option>
                <option value="Bleach">Bleach</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Đơn vị</label>
              <input 
                type="text" value={inForm.unit} onChange={e => setInForm({...inForm, unit: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-sky-500 font-bold transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Số lượng</label>
              <input 
                type="number" value={inForm.quantity} onChange={e => setInForm({...inForm, quantity: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-sky-500 font-bold transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Giá nhập/Đơn vị (đ)</label>
              <input 
                type="number" value={inForm.unitCost} onChange={e => setInForm({...inForm, unitCost: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-sky-500 font-bold transition-all" 
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Ghi chú / Nguồn</label>
              <input 
                type="text" value={inForm.referenceNote} onChange={e => setInForm({...inForm, referenceNote: e.target.value})} placeholder="NCC: Unilever"
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-sky-500 font-bold transition-all" 
              />
            </div>
          </div>
          <Button onClick={handleStockIn} className="w-full h-14 text-lg bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-500/20">Thêm vào kho</Button>
        </Card>

        {/* Usage Card */}
        <Card className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-indigo-600">Internal Usage (Xuất Kho)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Vật tư</label>
              <select 
                value={outForm.itemName} onChange={e => setOutForm({...outForm, itemName: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
              >
                <option value="Soap">Soap</option>
                <option value="Softener">Softener</option>
                <option value="Bleach">Bleach</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Số lượng</label>
              <input 
                type="number" value={outForm.quantity} onChange={e => setOutForm({...outForm, quantity: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" 
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mục đích (Ghi chú)</label>
              <input 
                type="text" value={outForm.referenceNote} onChange={e => setOutForm({...outForm, referenceNote: e.target.value})} placeholder="Dùng nội bộ..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" 
              />
            </div>
          </div>
          <Button onClick={handleUsage} className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 mt-auto pt-6">Log Usage (Ghi log sử dụng)</Button>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-tight">Recent Inventory Transactions</h3>
        </div>
        
        {loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Vật tư</th>
                  <th className="px-6 py-4">Số lượng</th>
                  <th className="px-6 py-4">Ghi chú</th>
                  <th className="px-6 py-4 text-right">Người thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">Chưa có giao dịch kho nào.</td></tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.inventoryTxnId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4 font-medium text-slate-500">{new Date(t.txnDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "flex items-center gap-1 font-bold",
                          t.txnType === 'IN' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {t.txnType === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                          {t.txnType === 'IN' ? "Stock In" : "Usage"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{t.itemName}</td>
                      <td className="px-6 py-4 font-black">{t.quantity} <span className="text-slate-400 text-xs font-normal">{t.unit}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{t.referenceNote || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.creatorName}</span>
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
