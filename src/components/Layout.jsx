import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings2,
  Moon,
  Sun,
  Bell,
  Search,
  LogOut,
  Truck
} from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { cn } from './ui';
import { authService } from "../services/authService";
export const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role;
  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  ];

  const adminLinks = [
  { 
    name: 'Reports', 
    icon: BarChart3, 
    path: '/admin/reports',
    roles: ["OWNER", "STAFF"]
  },
  { 
    name: 'Services', 
    icon: Settings, 
    path: '/admin/services',
    roles: ["OWNER", "STAFF"]
  },
  { 
    name: 'Shippers', 
    icon: Truck, 
    path: '/admin/shippers',
    roles: ["OWNER", "STAFF"]
  },
  { 
    name: 'User Management', 
    icon: Users, 
    path: '/admin/users',
    roles: ["OWNER"] // 👈 chỉ OWNER thấy
  },
];

  return (
    <aside className="w-64 h-screen bg-navy-950 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-sky-400 cursor-pointer" onClick={() => navigate('/')}>QuocKiet</h1>
        <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mt-1">Laundry Service</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-[11px] font-bold text-navy-500 uppercase tracking-widest mb-4 px-4">Main Menu</h3>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.name}>
                <NavLink 
                  to={link.path}
                  className={({ isActive }) => cn(
                    "sidebar-link",
                    isActive && "sidebar-link-active"
                  )}
                >
                  <link.icon size={20} />
                  <span>{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {role === "OWNER" && (
  <div>
    <h3 className="text-[11px] font-bold text-navy-500 uppercase tracking-widest mb-4 px-4">
      Administration
    </h3>

    <ul className="space-y-1">
      {adminLinks.map((link) => (
        <li key={link.name}>
          <NavLink 
            to={link.path}
            className={({ isActive }) => cn(
              "sidebar-link",
              isActive && "sidebar-link-active"
            )}
          >
            <link.icon size={20} />
            <span>{link.name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
)}
      </nav>

      <div className="p-4 border-t border-navy-900">
        <div className="bg-navy-900/50 rounded-xl p-4 flex items-center gap-3 group relative">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center font-bold">
            {user?.fullName
  ? user.fullName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
  : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate tracking-tight">
  {user?.fullName || "Unknown"}
</p>

<p className="text-xs text-navy-500 truncate">
  {user?.role || "No Role"}
</p>
          </div>
          <button 
            onClick={() => authService.logout()}
            className="p-2 rounded-lg hover:bg-rose-500/20 text-navy-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const Navbar = ({ isDark, setIsDark }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="max-w-md w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search orders, customers..." 
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
      </div>
    </header>
  );
};
