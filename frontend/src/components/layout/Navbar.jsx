import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eikenLogo from '/logo.png';
import {
  Home,
  Settings,
  Package,
  Users,
  Briefcase,
  FileText,
  Quote,
  LogOut,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react';

const Navbar = () => {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const { user, logout, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Limpiar primero
    logout();

    // Redirección inmediata que reemplaza la entrada actual del historial
    window.location.replace('/');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/intranet/dashboard',
      icon: Home,
      requiresRole: null
    },
    {
      name: 'Servicios',
      href: '/intranet/services',
      icon: Settings,
      requiresRole: null
    },
    {
      name: 'Inventario',
      href: '/intranet/inventory',
      icon: Package,
      requiresRole: null
    },
    {
      name: 'Productos',
      href: '/intranet/products',
      icon: Package,
      requiresRole: null
    },
    {
      name: 'Órdenes',
      href: '/intranet/orders',
      icon: ShoppingBag,
      requiresRole: null
    },
    {
      name: 'Proyectos',
      href: '/intranet/projects',
      icon: FileText,
      requiresRole: null
    },
    {
      name: 'Cotizaciones',
      href: '/intranet/quotes',
      icon: Quote,
      requiresRole: null
    },
    {
      name: 'Usuarios',
      href: '/intranet/users',
      icon: Users,
      requiresRole: 'admin'
    }
  ];

  // Filtrar elementos según el rol del usuario
  const filteredNavigation = navigationItems.filter(item => {
    if (!item.requiresRole) return true;
    if (item.requiresRole === 'admin') return isAdmin;
    if (item.requiresRole === 'manager') return isManager;
    return false;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'designer':
        return 'bg-green-100 text-green-800';
      case 'operator':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'designer':
        return 'Diseñador';
      case 'operator':
        return 'Operador';
      default:
        return role;
    }
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex flex-1">
            <div className="flex w-full items-center">
              <div className="flex-shrink-0 flex items-center mr-8">
                <Link to="/dashboard" className="flex items-center">
                  <img src={eikenLogo} alt="Eiken Design Logo" className="h-10 w-auto rounded shadow" />
                </Link>
              </div>
              <div className="relative hidden md:flex md:space-x-6 overflow-x-auto flex-nowrap navbar-scroll flex-1">
                {filteredNavigation.map((item) => {
                  if (item.name === 'Servicios') {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith('/intranet/services') || location.pathname.startsWith('/intranet/categories') || location.pathname.startsWith('/intranet/divisions');
                    return (
                      <div key="servicios-dropdown" className="relative">
                        <button
                          className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none whitespace-nowrap ${isActive
                            ? 'border-eiken-orange-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                          onClick={() => setIsServicesDropdownOpen((open) => !open)}
                          tabIndex={0}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          Servicios
                          <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {isServicesDropdownOpen && (
                          <div className="fixed mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[60]" style={{ top: '4rem', left: 'auto' }}>
                            <Link to="/intranet/services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md" onClick={() => setIsServicesDropdownOpen(false)}>Servicios</Link>
                            {(isAdmin || isManager) && (
                              <>
                                <Link to="/intranet/categories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsServicesDropdownOpen(false)}>Categorías</Link>
                                <Link to="/intranet/divisions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md" onClick={() => setIsServicesDropdownOpen(false)}>Divisiones</Link>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${isActive
                          ? 'border-eiken-orange-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    );
                  }
                })}
              </div>
              <div className="hidden md:flex md:items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <div className="flex items-center justify-end space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 ml-4"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil expandido */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredNavigation.map((item) => {
              if (item.name === 'Servicios') {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith('/intranet/services') || location.pathname.startsWith('/intranet/categories') || location.pathname.startsWith('/intranet/divisions');
                return (
                  <div key="servicios-dropdown-mobile" className="">
                    <div className={`flex items-center pl-3 pr-4 py-2 text-base font-medium border-l-4 ${isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      }`}>
                      <Icon className="w-5 h-5 mr-3" />
                      Servicios
                    </div>
                    <div className="ml-8">
                      <Link to="/intranet/services" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 hover:bg-gray-100">Servicios</Link>
                      <Link to="/intranet/categories" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 hover:bg-gray-100">Categorías</Link>
                      <Link to="/intranet/divisions" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 hover:bg-gray-100">Divisiones</Link>
                    </div>
                  </div>
                );
              } else {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 ${isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              }
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-1">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <LogOut className="w-5 h-5 mr-3" />
                  Salir
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
