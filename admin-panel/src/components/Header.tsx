import { Link, useNavigate } from 'react-router-dom';
import { Menu, Trash2, LogOut, LayoutDashboard, Map, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Zap, label: 'Add Auto', path: '/add-auto' },
    { icon: Map, label: 'Add Route', path: '/add-route' },
    { icon: Users, label: 'Add Driver', path: '/add-driver' },
    { icon: Zap, label: 'Assign Route', path: '/assign-route' },
    { icon: Map, label: 'Visual Mapping', path: '/visual-mapping' },
  ];

  return (
    <header className="bg-gradient-to-r from-karnataka-primary to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Trash2 className="w-6 h-6 text-karnataka-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nammakasa</h1>
              <p className="text-xs text-orange-100">Waste Management Admin</p>
            </div>
          </Link>

          {/* Admin Info & Menu Toggle */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{admin?.name}</p>
              <p className="text-xs text-orange-100">Ward {admin?.wardNo}</p>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-orange-600 rounded-lg transition-colors md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 bg-orange-700 hover:bg-orange-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex mt-4 space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-orange-600 px-4 py-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
