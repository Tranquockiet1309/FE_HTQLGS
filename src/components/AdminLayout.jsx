import { Sidebar, Navbar } from './Layout';
import { Outlet } from 'react-router-dom';

export const AdminLayout = ({ isDark, setIsDark }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 min-w-0">
        <Navbar isDark={isDark} setIsDark={setIsDark} />
        <main className="p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
