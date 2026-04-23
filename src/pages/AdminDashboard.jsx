import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, ShoppingBag, CheckCircle2, BarChart2 } from 'lucide-react';
import { Card, Badge, cn } from '../components/ui';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
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
  </motion.div>
);

// Custom tooltip cho biểu đồ đơn hàng
const OrderTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 text-sm">
      <p className="font-black text-slate-700 dark:text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill || p.stroke }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Custom tooltip cho biểu đồ doanh thu
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 text-sm">
      <p className="font-black text-slate-700 dark:text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill || p.stroke }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-emerald-600">{Number(p.value).toLocaleString('vi-VN')}đ</span>
        </div>
      ))}
    </div>
  );
};

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes] = await Promise.all([
        dashboardService.getStats(startDate, endDate),
        dashboardService.getMonthlySummary(5),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (monthlyRes.success) setMonthly(monthlyRes.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-slate-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const chartData = stats.dailyMetrics.map(m => ({
    name: new Date(m.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    Revenue: m.revenue,
    Expenses: m.expenses,
    Profit: m.profit
  }));

  // Tổng đơn + đơn hoàn thành từ monthly data
  const totalOrdersMonthly = monthly.reduce((s, m) => s + m.totalOrders, 0);
  const completedOrdersMonthly = monthly.reduce((s, m) => s + m.completedOrders, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tighter">Báo cáo &amp; Thống kê</h2>
        <p className="text-slate-500 font-medium">Tổng quan kinh doanh 30 ngày qua &amp; 5 tháng gần nhất.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0}    title="Tổng Doanh thu"       value={`${stats.totalRevenue.toLocaleString('vi-VN')} đ`}  icon={TrendingUp}  color="emerald" />
        <StatCard delay={0.05} title="Tổng Chi phí"         value={`${stats.totalExpenses.toLocaleString('vi-VN')} đ`} icon={TrendingDown} color="rose" />
        <StatCard delay={0.1}  title="Lợi nhuận"            value={`${stats.totalProfit.toLocaleString('vi-VN')} đ`}   icon={DollarSign}  color="sky" />
        <StatCard delay={0.15} title="Tổng Khách hàng"      value={stats.totalCustomers}                               icon={Users}       color="indigo" />
      </div>

      {/* 5-Month Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Đơn hàng theo tháng (Bar) */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Đơn hàng theo tháng</h3>
                  <p className="text-xs text-slate-400 font-medium">5 tháng gần nhất</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-600">{totalOrdersMonthly}</p>
                <p className="text-xs text-slate-400">tổng đơn</p>
              </div>
            </div>

            {/* Mini stat row */}
            <div className="flex gap-3">
              <div className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">{totalOrdersMonthly}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Tất cả đơn</p>
              </div>
              <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{completedOrdersMonthly}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Hoàn thành</p>
              </div>
              <div className="flex-1 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-amber-700 dark:text-amber-300">
                  {totalOrdersMonthly > 0 ? Math.round((completedOrdersMonthly / totalOrdersMonthly) * 100) : 0}%
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Tỷ lệ HT</p>
              </div>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<OrderTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="totalOrders" name="Tổng đơn" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {monthly.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="completedOrders" name="Hoàn thành" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Chart 2: Doanh thu theo tháng (Area) */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Doanh thu theo tháng</h3>
                  <p className="text-xs text-slate-400 font-medium">5 tháng gần nhất</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-600">
                  {monthly.reduce((s, m) => s + m.revenue, 0).toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-slate-400">tổng 5 tháng</p>
              </div>
            </div>

            {/* Peak month */}
            {monthly.length > 0 && (() => {
              const peak = monthly.reduce((max, m) => m.revenue > max.revenue ? m : max, monthly[0]);
              const lowest = monthly.reduce((min, m) => m.revenue < min.revenue ? m : min, monthly[0]);
              return (
                <div className="flex gap-3">
                  <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">📈 Tháng cao nhất</p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">{peak.monthLabel}</p>
                    <p className="text-xs text-slate-500">{peak.revenue.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="flex-1 bg-red-50 dark:bg-red-500/10 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">📉 Tháng thấp nhất</p>
                    <p className="text-sm font-black text-red-700 dark:text-red-300">{lowest.monthLabel}</p>
                    <p className="text-xs text-slate-500">{lowest.revenue.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              );
            })()}

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonthRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMonthRev)"
                    dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row: Daily Finance + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Biểu đồ Tài chính</h3>
              <p className="text-sm text-slate-500">Doanh thu &amp; Chi phí theo ngày (30 ngày)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `${value.toLocaleString('vi-VN')} đ`}
                />
                <Legend />
                <Area type="monotone" dataKey="Revenue"  stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
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
