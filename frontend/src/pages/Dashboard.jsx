import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Settings, 
  Package, 
  Briefcase, 
  FileText, 
  Quote,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { servicesAPI, inventoryAPI, suppliersAPI, projectsAPI, quotesAPI, usersAPI } from '../services/apiService';

const Dashboard = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    services: 0,
    inventory: 0,
    suppliers: 0,
    projects: 0,
    quotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar estadísticas básicas
        const promises = [
          servicesAPI.getAll().catch(error => {
            console.error('Error loading services:', error);
            return { data: [] };
          }),
          inventoryAPI.getAll().catch(error => {
            console.error('Error loading inventory:', error);
            return { data: [] };
          }),
          suppliersAPI.getAll().catch(error => {
            console.error('Error loading suppliers:', error);
            return { data: [] };
          }),
          projectsAPI.getAll().catch(error => {
            console.error('Error loading projects:', error);
            return { data: [] };
          }),
          quotesAPI.getAll().catch(error => {
            console.error('Error loading quotes:', error);
            return { data: [] };
          })
        ];

        // Solo cargar usuarios si tiene permisos
        if (isManager) {
          promises.push(usersAPI.getAll().catch(error => {
            console.error('Error loading users:', error);
            return { data: [] };
          }));
        }

        const results = await Promise.all(promises);
        
        setStats({
          services: results[0]?.data?.length || 0,
          inventory: results[1]?.data?.length || 0,
          suppliers: results[2]?.data?.length || 0,
          projects: results[3]?.data?.length || 0,
          quotes: results[4]?.data?.length || 0,
          users: isManager ? (results[5]?.data?.length || 0) : 0
        });

        // Simular actividad reciente
        setRecentActivity([
          { id: 1, type: 'project', message: 'Nuevo proyecto "Wrap Taxi Regional" creado', time: '2 min ago' },
          { id: 2, type: 'quote', message: 'Cotización aprobada para Empresa Test', time: '15 min ago' },
          { id: 3, type: 'inventory', message: 'Stock bajo en Vinilo Metalizado Plata', time: '1 hora ago' },
          { id: 4, type: 'service', message: 'Servicio "Wrap Parcial" actualizado', time: '2 horas ago' }
        ]);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isManager]);

  const dashboardCards = [
    {
      title: 'Servicios',
      value: stats.services,
      icon: Settings,
      color: 'bg-blue-500',
      href: '/services'
    },
    {
      title: 'Inventario',
      value: stats.inventory,
      icon: Package,
      color: 'bg-green-500',
      href: '/inventory'
    },
    {
      title: 'Proveedores',
      value: stats.suppliers,
      icon: Briefcase,
      color: 'bg-purple-500',
      href: '/suppliers'
    },
    {
      title: 'Proyectos',
      value: stats.projects,
      icon: FileText,
      color: 'bg-orange-500',
      href: '/projects'
    },
    {
      title: 'Cotizaciones',
      value: stats.quotes,
      icon: Quote,
      color: 'bg-pink-500',
      href: '/quotes'
    }
  ];

  // Solo mostrar usuarios si tiene permisos
  if (isAdmin) {
    dashboardCards.unshift({
      title: 'Usuarios',
      value: stats.users,
      icon: Users,
      color: 'bg-red-500',
      href: '/users'
    });
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project':
        return FileText;
      case 'quote':
        return Quote;
      case 'inventory':
        return Package;
      case 'service':
        return Settings;
      default:
        return AlertCircle;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'project':
        return 'text-orange-600';
      case 'quote':
        return 'text-pink-600';
      case 'inventory':
        return 'text-green-600';
      case 'service':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Resumen del sistema de gestión Eiken Design
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a
                    href={card.href}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Ver todos
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-gray-400" />
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);
                    
                    return (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {index !== recentActivity.length - 1 && (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100`}>
                                <Icon className={`h-4 w-4 ${colorClass}`} />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {activity.message}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {activity.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Acciones Rápidas
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {isManager && (
                <a
                  href="/services"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Nuevo Servicio
                </a>
              )}
              
              {isManager && (
                <a
                  href="/inventory"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Agregar Inventario
                </a>
              )}
              
              <a
                href="/projects"
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </a>
              
              <a
                href="/quotes"
                className="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Quote className="h-4 w-4 mr-2" />
                Ver Cotizaciones
              </a>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Mi Información
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nombre:</span>
                  <p className="text-sm text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Rol:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'designer' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role === 'admin' ? 'Administrador' :
                     user?.role === 'manager' ? 'Gerente' :
                     user?.role === 'designer' ? 'Diseñador' :
                     'Operador'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
