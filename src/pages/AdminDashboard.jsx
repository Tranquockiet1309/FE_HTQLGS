import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Card, Badge, cn } from '../components/ui';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="flex flex-col gap-4 group hover:scale-[1.02] transition-all relative overflow-hidden">
    <div className={cn(
      "absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-20",
      `bg-${color}-500`
    )} />
    <div className="flex justify-between items-start">
      <div className={cn(
        "p-3 rounded-2xl flex items-center justify-center relative z-10",
        `bg-${color}-100 text-${color}-600 dark:bg-${color}-500/20 dark:text-${color}-400`
      )}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-3xl font-black tracking-tight">{value}</h3>
    </div>
  </Card>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default to last 30 days
  const [startDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats(startDate, endDate);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Format Daily Metrics for chart
  const chartData = stats.dailyMetrics.map(m => ({
    name: new Date(m.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    Revenue: m.revenue,
    Expenses: m.expenses,
    Profit: m.profit
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tighter">Báo cáo & Thống kê</h2>
        <p className="text-slate-500 font-medium">Tổng quan tình hình kinh doanh 30 ngày qua.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh thu" 
          value={`${stats.totalRevenue.toLocaleString('vi-VN')} đ`} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <StatCard 
          title="Tổng Chi phí" 
          value={`${stats.totalExpenses.toLocaleString('vi-VN')} đ`} 
          icon={TrendingDown} 
          color="rose" 
        />
        <StatCard 
          title="Lợi nhuận" 
          value={`${stats.totalProfit.toLocaleString('vi-VN')} đ`} 
          icon={DollarSign} 
          color="sky" 
        />
        <StatCard 
          title="Tổng Khách hàng (mới)" 
          value={stats.totalCustomers} 
          icon={Users} 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Biểu đồ Tài chính</h3>
              <p className="text-sm text-slate-500">Doanh thu & Chi phí theo ngày</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `${value.toLocaleString('vi-VN')} đ`}
                />
                <Legend />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Cảnh báo Tồn kho</h3>
            <Badge variant="warning" className="rounded-full w-8 h-8 flex items-center justify-center p-0">
              {stats.inventoryWarnings.length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {stats.inventoryWarnings.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={24} />
                </div>
                Kho hàng ổn định
              </div>
            ) : (
              stats.inventoryWarnings.map((warn, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{warn.itemName}</p>
                      <p className="text-xs text-orange-600 font-medium">Sắp hết hàng</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-rose-600">{warn.currentBalance} <span className="text-xs font-normal">{warn.unit}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};
