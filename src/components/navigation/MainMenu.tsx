import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '../icons/FontAwesomeIcon';
import { useAuthStore } from '../../store/authStore';

interface MainMenuProps {
  className?: string;
}

export const MainMenu: React.FC<MainMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = user?.role === 'admin' ? [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FontAwesomeIcon icon="fas fa-home" size={18} />,
      path: '/dashboard',
      description: 'Overview and statistics'
    },
    {
      id: 'floor-plans',
      label: 'Create Floor Plan',
      icon: <FontAwesomeIcon icon="fas fa-plus-circle" size={18} />,
      path: '/admin/floor-plans/new',
      description: 'Create new floor plans'
    },
    {
      id: 'floor-plans-list',
      label: 'Manage Floor Plans',
      icon: <FontAwesomeIcon icon="fas fa-file-alt" size={18} />,
      action: 'show-manager',
      description: 'View and manage all floor plans'
    },
    {
      id: 'users',
      label: 'Users',
      icon: <FontAwesomeIcon icon="fas fa-users" size={18} />,
      path: '/users',
      description: 'User management'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FontAwesomeIcon icon="fas fa-cog" size={18} />,
      path: '/settings',
      description: 'Application settings'
    }
  ] : [
    {
      id: 'floor-plans',
      label: 'Floor Plans',
      icon: <FontAwesomeIcon icon="fas fa-map" size={18} />,
      path: '/floor-plans',
      description: 'View available floor plans'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FontAwesomeIcon icon="fas fa-cog" size={18} />,
      path: '/settings',
      description: 'Application settings'
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.action === 'show-manager') {
      // Dispatch custom event to show floor plan manager
      window.dispatchEvent(new CustomEvent('showFloorPlanManager'));
    } else if (item.path) {
      navigate(item.path);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('/floor-plans')) return 'Floor Plans';
    if (currentPath.includes('/dashboard')) return 'Dashboard';
    if (currentPath.includes('/users')) return 'Users';
    if (currentPath.includes('/settings')) return 'Settings';
    return 'IMTMA Flooring';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
      >
        <FontAwesomeIcon icon="fas fa-bars" size={18} />
        <span className="font-medium">{getCurrentPageTitle()}</span>
        <span className="text-blue-200">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100"></div>

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-150 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 group-hover:text-red-600 transition-colors">
                  <FontAwesomeIcon icon="fas fa-sign-out-alt" size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-red-600">
                    Sign Out
                  </p>
                  <p className="text-xs text-gray-500">Return to landing page</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};