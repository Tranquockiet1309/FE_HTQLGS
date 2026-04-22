import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Clock, Scale } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/ui';
import { productService } from '../services/productService';
import { toast } from 'react-hot-toast';

export const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceName: '',
    unit: '',
    unitPrice: '',
    estimatedHours: ''
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll(false); // get all, including inactive
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
    try {
      await productService.delete(id);
      toast.success("Xóa dịch vụ thành công!");
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa dịch vụ");
    }
  };

  const handleAddService = () => {
    setFormData({
      serviceName: '',
      unit: '',
      unitPrice: '',
      estimatedHours: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null
      };
      
      const response = await productService.create(data);
      if (response.success) {
        toast.success("Thêm dịch vụ mới thành công!");
        setIsModalOpen(false);
        fetchServices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm dịch vụ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Dịch vụ</h2>
          <p className="text-slate-500 font-medium">Bảng giá và các dịch vụ giặt là của tiệm.</p>
        </div>
        <Button onClick={handleAddService} className="gap-2">
          <Plus size={20} />
          <span>Thêm Dịch vụ</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Tên dịch vụ</th>
                  <th className="px-6 py-4">Đơn vị</th>
                  <th className="px-6 py-4 text-center">Thời gian ƯT</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Đơn giá</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Chưa có dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  services.map((svc) => (
                    <tr key={svc.serviceId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Settings size={16} />
                        </div>
                        {svc.serviceName}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium italic">{svc.unit}</td>
                      <td className="px-6 py-4 text-center text-slate-500">
                        {svc.estimatedHours ? `${svc.estimatedHours}h` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={svc.isActive ? "success" : "secondary"}>
                          {svc.isActive ? "Hoạt động" : "Tạm ngưng"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-black text-right text-primary-600 dark:text-primary-400">
                        {svc.unitPrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:text-sky-600 rounded-lg transition-colors text-slate-400">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(svc.serviceId)}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-600 rounded-lg transition-colors text-slate-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Thêm Dịch vụ Mới"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Tên Dịch vụ</label>
            <div className="relative group">
              <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input 
                type="text" 
                required
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                placeholder="Ví dụ: Giặt sấy khô"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Đơn vị</label>
              <div className="relative group">
                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="kg, cái, m2..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Đơn giá (đ)</label>
              <input 
                type="number" 
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                placeholder="15000"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-primary-600 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Thời gian Ước tính (giờ)</label>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input 
                type="number" 
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                placeholder="2, 4, 24..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="flex-[2]"
            >
              Lưu Dịch vụ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
