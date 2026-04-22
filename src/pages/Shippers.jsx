import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  User, 
  Phone, 
  Link as LinkIcon, 
  Search, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Link2,
  ChevronRight
} from 'lucide-react';
import { deliveryService } from '../services/deliveryService';
import { usersService } from '../services/usersService';
import { Card, Button, Badge, Modal } from '../components/ui';
import toast from 'react-hot-toast';

export const Shippers = () => {
  const [shippers, setShippers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shippersRes, usersRes] = await Promise.all([
        deliveryService.getShippers(),
        usersService.getByRole('SHIPPER')
      ]);
      setShippers(shippersRes.data || []);
      setAvailableUsers(usersRes.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkUser = async () => {
    if (!selectedShipper || !selectedUser) return;
    
    try {
      await deliveryService.linkUser(selectedShipper.shipperId, selectedUser.userId);
      toast.success("Liên kết tài khoản thành công");
      setIsLinkModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi liên kết");
    }
  };

  const filteredShippers = shippers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">Shippers</h2>
          <p className="text-slate-500 font-medium">Quản lý đội ngũ giao hàng và liên kết tài khoản</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm shipper..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="gap-2">
            <Plus size={18} /> Thêm Shipper
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredShippers.map((shipper) => (
            <motion.div
              key={shipper.shipperId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="group hover:border-primary-500/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Truck size={24} />
                  </div>
                  <div className="flex gap-2">
                    {shipper.userId ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 size={12} /> Đã liên kết
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <XCircle size={12} /> Chưa liên kết
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{shipper.name}</h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Phone size={14} />
                    {shipper.phone}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tài khoản Login</div>
                    {shipper.userId ? (
                      <div className="text-sm font-bold text-primary-600 flex items-center gap-1">
                         <User size={14} /> ID: {shipper.userId}
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedShipper(shipper);
                          setIsLinkModalOpen(true);
                        }}
                        className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
                      >
                        <Link2 size={14} /> Liên kết ngay
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Link User Modal */}
      <Modal 
        isOpen={isLinkModalOpen} 
        onClose={() => setIsLinkModalOpen(false)} 
        title={`Liên kết tài khoản cho ${selectedShipper?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">Chọn một tài khoản người dùng có Role là **SHIPPER** để liên kết với nhân viên này.</p>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {availableUsers.filter(u => !shippers.some(s => s.userId === u.userId)).length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-medium">Không còn tài khoản Shipper nào trống</div>
            ) : (
              availableUsers.filter(u => !shippers.some(s => s.userId === u.userId)).map((user) => (
                <button
                  key={user.userId}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedUser?.userId === user.userId 
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "border-slate-100 dark:border-slate-800 hover:border-primary-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                  {selectedUser?.userId === user.userId && <CheckCircle2 size={20} className="text-primary-500" />}
                </button>
              ))
            )}
          </div>

          <Button 
            className="w-full h-14 text-lg mt-4" 
            disabled={!selectedUser}
            onClick={handleLinkUser}
          >
            Xác nhận liên kết
          </Button>
        </div>
      </Modal>
    </div>
  );
};
