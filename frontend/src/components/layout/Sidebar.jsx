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
    Layers,
    Sliders,
    ShoppingCart
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const { isAdmin, isManager } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState({
        'e-commerce': true,
        'gestion-interna': true,
        'configuracion': true,
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
        }
    ];

    if (isManager) {
        navigationGroups.push({
            type: 'group',
            id: 'e-commerce',
            name: 'E-Commerce',
            icon: ShoppingCart,
            items: [
                { name: 'Órdenes', href: '/intranet/orders', icon: ShoppingBag },
                { name: 'Productos', href: '/intranet/products', icon: Package },
                { name: 'Datos Tienda', href: '/intranet/settings', icon: Settings }
            ]
        });
    }

    navigationGroups.push({
        type: 'group',
        id: 'gestion-interna',
        name: 'Gestión Interna',
        icon: FileText,
        items: [
            { name: 'Cotizaciones', href: '/intranet/quotes', icon: Quote },
            { name: 'Inventario', href: '/intranet/inventory', icon: Boxes },
            { name: 'Proyectos', href: '/intranet/projects', icon: FileText },
            { name: 'Servicios', href: '/intranet/services', icon: Settings }
        ]
    });

    if (isManager) {
        navigationGroups.push({
            type: 'group',
            id: 'configuracion',
            name: 'Configuración',
            icon: Sliders,
            items: [
                { name: 'Categorías', href: '/intranet/categories', icon: Tag },
                { name: 'Divisiones', href: '/intranet/divisions', icon: Layers }
            ]
        });
    }

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
            >
                <div className="flex flex-col h-full text-slate-300">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        {!isCollapsed && (
                            <Link to="/intranet/dashboard" className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                                    <span className="text-white font-bold text-xl">E</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-xl text-white tracking-tight">Eiken</span>
                                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Intranet</span>
                                </div>
                            </Link>
                        )}
                        {isCollapsed && (
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-orange-900/20">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                        )}

                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                        <div className="space-y-2">
                            {navigationGroups.map((group, idx) => (
                                <div key={idx}>
                                    {group.type === 'single' ? (
                                        <Link
                                            to={group.href}
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                        ${isActive(group.href)
                                                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-900/30'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                }
                      `}
                                            title={isCollapsed ? group.name : ''}
                                        >
                                            <group.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-colors ${isActive(group.href) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                            {!isCollapsed && <span className="font-medium">{group.name}</span>}
                                        </Link>
                                    ) : (
                                        <div className="mb-2">
                                            {/* Group Header */}
                                            <button
                                                onClick={() => toggleGroup(group.id)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                          ${isGroupActive(group.items) && isCollapsed
                                                        ? 'bg-slate-800 text-orange-400'
                                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                    }
                        `}
                                                title={isCollapsed ? group.name : ''}
                                            >
                                                <div className="flex items-center">
                                                    <group.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-colors ${isGroupActive(group.items) ? 'text-orange-400' : 'text-slate-400 group-hover:text-white'}`} />
                                                    {!isCollapsed && <span className="font-medium">{group.name}</span>}
                                                </div>
                                                {!isCollapsed && (
                                                    <div className={`transition-transform duration-200 ${expandedGroups[group.id] ? 'rotate-180' : ''}`}>
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </div>
                                                )}
                                            </button>

                                            {/* Group Items */}
                                            {!isCollapsed && expandedGroups[group.id] && (
                                                <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                                                    {group.items.map((item, itemIdx) => (
                                                        <Link
                                                            key={itemIdx}
                                                            to={item.href}
                                                            className={`flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                                ${isActive(item.href)
                                                                    ? 'bg-slate-800 text-orange-400 font-medium'
                                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                                }
                              `}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive(item.href) ? 'bg-orange-400' : 'bg-slate-600'}`}></div>
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
                    <div className="hidden lg:block p-4 border-t border-slate-800">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full flex items-center justify-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200 group"
                            title={isCollapsed ? 'Expandir' : 'Contraer'}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-5 w-5" />
                            ) : (
                                <>
                                    <Menu className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Contraer Menú</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
