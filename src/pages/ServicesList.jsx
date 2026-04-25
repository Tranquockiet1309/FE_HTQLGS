import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Clock, Scale, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/ui';
import { productService } from '../services/productService';
import { toast } from 'react-hot-toast';

const EMPTY_FORM = {
  serviceName: '',
  unit: '',
  unitPrice: '',
  estimatedHours: '',
  isActive: true,
};

export const ServicesList = () => {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId]   = useState(null); // null = add mode
  const [deleteTarget, setDeleteTarget] = useState(null); // { serviceId, serviceName }
  const [isDeleting, setIsDeleting]     = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll(false);
      if (response.success) setServices(response.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  /* ── Open modal ── */
  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditingId(svc.serviceId);
    setFormData({
      serviceName:    svc.serviceName,
      unit:           svc.unit,
      unitPrice:      String(svc.unitPrice),
      estimatedHours: svc.estimatedHours != null ? String(svc.estimatedHours) : '',
      isActive:       svc.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  /* ── Submit (create or update) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        unitPrice:      parseFloat(formData.unitPrice),
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
      };

      if (editingId) {
        const res = await productService.update(editingId, payload);
        if (res.success) {
          toast.success('Cập nhật dịch vụ thành công!');
          closeModal();
          fetchServices();
        }
      } else {
        const res = await productService.create(payload);
        if (res.success) {
          toast.success('Thêm dịch vụ mới thành công!');
          closeModal();
          fetchServices();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu dịch vụ');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productService.delete(deleteTarget.serviceId);
      toast.success('Xóa dịch vụ thành công!');
      setDeleteTarget(null);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa dịch vụ');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── UI ── */
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Quản lý Dịch vụ</h2>
          <p className="text-slate-500 font-medium">Bảng giá và các dịch vụ giặt là của tiệm.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={20} />
          <span>Thêm Dịch vụ</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
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
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Settings size={16} />
                          </div>
                          {svc.serviceName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium italic">{svc.unit}</td>
                      <td className="px-6 py-4 text-center text-slate-500">
                        {svc.estimatedHours ? `${svc.estimatedHours}h` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={svc.isActive ? 'success' : 'secondary'}>
                          {svc.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-black text-right text-primary-600 dark:text-primary-400">
                        {svc.unitPrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(svc)}
                            className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:text-sky-600 rounded-lg transition-colors text-slate-400"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ serviceId: svc.serviceId, serviceName: svc.serviceName })}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-600 rounded-lg transition-colors text-slate-400"
                            title="Xóa"
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

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
              Tên Dịch vụ
            </label>
            <div className="relative group">
              <Settings
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                required
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                placeholder="Ví dụ: Giặt sấy khô"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Unit + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
                Đơn vị
              </label>
              <div className="relative group">
                <Scale
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, cái, m2..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
                Đơn giá (đ)
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="15000"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-primary-600 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Estimated hours */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
              Thời gian Ước tính (giờ)
            </label>
            <div className="relative group">
              <Clock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                size={18}
              />
              <input
                type="number"
                min={0}
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="2, 4, 24..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* isActive toggle — only shown in edit mode */}
          {editingId && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">Trạng thái hoạt động</p>
                <p className="text-xs text-slate-400">Tắt để tạm ngưng dịch vụ này</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className="transition-colors"
              >
                {formData.isActive
                  ? <ToggleRight size={36} className="text-emerald-500" />
                  : <ToggleLeft  size={36} className="text-slate-400" />
                }
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-[2]">
              {editingId ? 'Lưu thay đổi' : 'Thêm Dịch vụ'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xóa"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-black text-slate-800 dark:text-white text-sm">Bạn sắp xóa dịch vụ:</p>
              <p className="text-rose-600 font-black text-base mt-0.5">{deleteTarget?.serviceName}</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hành động này <strong className="text-rose-600">không thể hoàn tác</strong>. Dịch vụ sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              isLoading={isDeleting}
              className="flex-[2] bg-rose-600 hover:bg-rose-700 shadow-rose-500/30"
              onClick={confirmDelete}
            >
              {!isDeleting && <Trash2 size={16} className="mr-2" />}
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
