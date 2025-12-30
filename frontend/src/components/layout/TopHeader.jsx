import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';

const TopHeader = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.replace('/');
    };

    const getRoleName = (role) => {
        const roles = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'designer': 'Diseñador',
            'operator': 'Operador'
        };
        return roles[role] || role;
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Left side - Mobile menu button */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Breadcrumb or page title can go here */}
                    <div className="hidden md:block">
                        <h1 className="text-lg font-semibold text-gray-900">
                            {/* Dynamic title based on route could be added here */}
                        </h1>
                    </div>
                </div>

                {/* Right side - Notifications & User menu */}
                <div className="flex items-center space-x-4">
                    {/* Notifications - placeholder for future */}
                    <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
                        <Bell className="h-5 w-5" />
                        {/* Notification badge - uncomment when needed
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            */}
                    </button>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{getRoleName(user?.role)}</p>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* Dropdown menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2
                      ${user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user?.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                                                    user?.role === 'designer' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {getRoleName(user?.role)}
                                        </span>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        {/* Profile - placeholder for future
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4 mr-3" />
                      Mi Perfil
                    </button>
                    */}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
