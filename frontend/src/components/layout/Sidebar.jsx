import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    Home,
    Settings,
    Package,
    ShoppingBag,
    FileText,
    MessageSquare as Quote,
    Users,
    Boxes,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Tag,
    Layers
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const { isAdmin } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState({
        'productos-tienda': true,
        'servicios-proyectos': true,
        admin: true
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    const toggleGroup = (group) => {
        if (!isCollapsed) {
            setExpandedGroups(prev => ({
                ...prev,
                [group]: !prev[group]
            }));
        }
    };

    const navigationGroups = [
        {
            type: 'single',
            name: 'Dashboard',
            href: '/intranet/dashboard',
            icon: Home
        },
        {
            type: 'group',
            id: 'productos-tienda',
            name: 'Productos & Tienda',
            icon: ShoppingBag,
            items: [
                { name: 'Productos', href: '/intranet/products', icon: Package },
                { name: 'Inventario', href: '/intranet/inventory', icon: Boxes },
                { name: 'Órdenes', href: '/intranet/orders', icon: ShoppingBag }
            ]
        },
        {
            type: 'group',
            id: 'servicios-proyectos',
            name: 'Servicios & Proyectos',
            icon: Settings,
            items: [
                { name: 'Servicios', href: '/intranet/services', icon: Settings },
                { name: 'Proyectos', href: '/intranet/projects', icon: FileText },
                { name: 'Cotizaciones', href: '/intranet/quotes', icon: Quote },
                { name: 'Categorías', href: '/intranet/categories', icon: Tag },
                { name: 'Divisiones', href: '/intranet/divisions', icon: Layers }
            ]
        }
    ];

    // Agregar grupo de administración si el usuario es admin
    if (isAdmin) {
        navigationGroups.push({
            type: 'group',
            id: 'admin',
            name: 'Administración',
            icon: Users,
            items: [
                { name: 'Usuarios', href: '/intranet/users', icon: Users }
            ]
        });
    }

    const isActive = (href) => location.pathname === href;
    const isGroupActive = (items) => items?.some(item => location.pathname === item.href);

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        {!isCollapsed && (
                            <Link to="/intranet/dashboard" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">E</span>
                                </div>
                                <span className="font-bold text-xl text-gray-900">Eiken</span>
                            </Link>
                        )}
                        {isCollapsed && (
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center mx-auto">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                        )}

                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-2">
                        <div className="space-y-1">
                            {navigationGroups.map((group, idx) => (
                                <div key={idx}>
                                    {group.type === 'single' ? (
                                        <Link
                                            to={group.href}
                                            className={`flex items-center px-3 py-2 rounded-lg transition-colors
                        ${isActive(group.href)
                                                    ? 'bg-orange-50 text-orange-600 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }
                      `}
                                            title={isCollapsed ? group.name : ''}
                                        >
                                            <group.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                                            {!isCollapsed && <span>{group.name}</span>}
                                        </Link>
                                    ) : (
                                        <div>
                                            {/* Group Header */}
                                            <button
                                                onClick={() => toggleGroup(group.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                          ${isGroupActive(group.items)
                                                        ? 'bg-orange-50 text-orange-600'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                    }
                        `}
                                                title={isCollapsed ? group.name : ''}
                                            >
                                                <div className="flex items-center">
                                                    <group.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                                                    {!isCollapsed && <span className="font-medium">{group.name}</span>}
                                                </div>
                                                {!isCollapsed && (
                                                    expandedGroups[group.id] ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )
                                                )}
                                            </button>

                                            {/* Group Items */}
                                            {!isCollapsed && expandedGroups[group.id] && (
                                                <div className="mt-1 ml-4 space-y-1">
                                                    {group.items.map((item, itemIdx) => (
                                                        <Link
                                                            key={itemIdx}
                                                            to={item.href}
                                                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors
                                ${isActive(item.href)
                                                                    ? 'bg-orange-50 text-orange-600 font-medium'
                                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                                }
                              `}
                                                        >
                                                            <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </nav>

                    {/* Collapse Toggle - Desktop only */}
                    <div className="hidden lg:block p-4 border-t border-gray-200">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full flex items-center justify-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title={isCollapsed ? 'Expandir' : 'Contraer'}
                        >
                            <Menu className="h-5 w-5" />
                            {!isCollapsed && <span className="ml-3">Contraer</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
