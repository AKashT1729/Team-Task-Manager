import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users as UsersIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
     ...(isAdmin ? [{ name: 'Users', href: '/users', icon: UsersIcon }] : []),
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {sidebarOpen ? (
            <span className="text-xl font-bold text-primary-600">TaskFlow</span>
          ) : (
            <FolderKanban className="w-8 h-8 text-primary-600" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.name : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-gray-200 p-2">
          <div className={`flex items-center px-4 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 mt-1 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
