import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Package, FileText, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '@/services/apiService';

const TopHeader = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Notification logic
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await dashboardAPI.getData();
                const data = response?.data?.data?.summary;

                const newNotifications = [];

                if (data?.lowStockItems > 0) {
                    newNotifications.push({
                        id: 'stock',
                        title: 'Stock Crítico',
                        message: `${data.lowStockItems} productos con stock bajo`,
                        type: 'error',
                        icon: Package,
                        color: 'text-red-600',
                        bg: 'bg-red-100',
                        link: '/intranet/inventory'
                    });
                }

                if (data?.pendingQuotes > 0) {
                    newNotifications.push({
                        id: 'quotes',
                        title: 'Nuevas Cotizaciones',
                        message: `${data.pendingQuotes} cotizaciones pendientes`,
                        type: 'info',
                        icon: FileText,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100',
                        link: '/intranet/quotes'
                    });
                }

                setNotifications(newNotifications);
                setUnreadCount(newNotifications.length);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

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

                    <div className="hidden md:block">
                        <h1 className="text-lg font-semibold text-gray-900">
                            Panel de Control
                        </h1>
                    </div>
                </div>

                {/* Right side - Notifications & User menu */}
                <div className="flex items-center space-x-4">

                    {/* Notifications Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative focus:outline-none"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-700">Notificaciones</h3>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                                {unreadCount} nuevas
                                            </span>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => {
                                                const Icon = notif.icon;
                                                return (
                                                    <Link
                                                        key={notif.id}
                                                        to={notif.link}
                                                        onClick={() => setShowNotifications(false)}
                                                        className="flex items-start px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className={`flex-shrink-0 ${notif.bg} p-2 rounded-full`}>
                                                            <Icon className={`h-4 w-4 ${notif.color}`} />
                                                        </div>
                                                        <div className="ml-3 w-0 flex-1 pt-0.5">
                                                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                <AlertCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                                <p className="text-sm">No tienes notificaciones pendientes</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                        >
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center shadow-sm">
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
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
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
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
