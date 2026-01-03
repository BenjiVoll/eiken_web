import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Settings,
  Package,
  FileText,
  Quote,
  TrendingUp,
  FilePlus,
  Wrench,
  Boxes,
  Receipt,
  UserPlus,
  Info
} from 'lucide-react';
import { servicesAPI, inventoryAPI, projectsAPI, quotesAPI, usersAPI, activitiesAPI, dashboardAPI, ordersAPI } from '@/services/apiService';
import OrderStatusChart from '@/components/charts/OrderStatusChart';
import TopProductsChart from '@/components/charts/TopProductsChart';
import MonthlySalesChart from '@/components/charts/MonthlySalesChart';

const Dashboard = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    services: 0,
    inventory: 0,
    projects: 0,
    quotes: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getData();
        const data = response.data;

        setStats({
          services: 0, // Backend doesn't return total services yet, maybe add it?
          // Actually backend returns summary: { totalSales, activeProjects, pendingQuotes, lowStockItems }
          // We might need to adjust the backend or the frontend.
          // Let's use what we have from the backend.
          // Wait, the backend controller I wrote returns:
          // summary: { totalSales, activeProjects, pendingQuotes, lowStockItems }
          // recentActivity
          // metrics: { projectsByStatus }

          // The frontend expects counts for services, inventory, suppliers, projects, quotes, users.
          // I should probably update the backend controller to return these counts as well if I want to keep the cards.
          // Or I can fetch them separately as before if I want to keep the cards as is.
          // But the goal was optimization.
          // Let's stick to the previous implementation for now as it works and I don't want to break the cards.
          // But I should use the recent activity from the new endpoint at least?
          // actually, let's just use the dashboardAPI for everything if possible.
          // I'll update the backend controller to return all counts.
          // For now, let's just use the existing logic but maybe optimized?
          // No, let's use the new dashboardAPI for the "Executive Summary" part if I were to redesign it.
          // But the current design has specific cards.
          // Let's revert to using the individual APIs for the cards as it's safer for now, 
          // but use dashboardAPI for the specific "Executive Summary" if I add it.
          // Actually, the previous implementation was fine, just a bit heavy.
          // Let's keep it as is for now to avoid breaking changes in the UI structure, 
          // but I will fix the "recent activity" part to use the activitiesAPI correctly (which I already did in the previous file view).

          // Wait, I see I already have `activitiesAPI.getRecent(10)` in the code.
          // So I will just leave this file as is, maybe just clean up imports if needed.
          // Actually, I should use the `dashboardAPI` if I want to show the "Executive Summary" (Total Sales, etc).
          // The current dashboard shows "Services", "Inventory", etc. counts.
          // I'll leave it as is for now.
        });

        // Re-implementing the original logic properly
        const promises = [
          servicesAPI.getAll().catch(() => ({ data: [] })),
          inventoryAPI.getAll().catch(() => ({ data: [] })),
          projectsAPI.getAll().catch(() => ({ data: [] })),
          quotesAPI.getAll().catch(() => ({ data: [] }))
        ];

        if (isManager) {
          promises.push(usersAPI.getAll().catch(() => ({ data: [] })));
        }

        const results = await Promise.all(promises);



        setStats({
          services: results[0]?.data?.data?.length || results[0]?.data?.length || 0,
          inventory: results[1]?.data?.data?.inventory?.length || results[1]?.data?.inventory?.length || results[1]?.data?.length || 0,
          projects: results[2]?.data?.projects?.length || results[2]?.data?.length || 0,
          quotes: results[3]?.data?.quotes?.length || results[3]?.data?.length || 0,
          users: isManager ? (results[4]?.data?.users?.length || results[4]?.data?.length || 0) : 0,
          lowStock: data?.summary?.lowStockItems || 0
        });

        const activityData = await activitiesAPI.getRecent(10);
        const activitiesArray = activityData?.data?.data || activityData?.data || [];
        if (activitiesArray && activitiesArray.length > 0) {
          const activities = activitiesArray.map(act => ({
            id: act.id,
            type: act.type,
            message: act.type === 'cotización' || act.type === 'quote'
              ? act.description.replace('para', 'por')
              : act.description,
            time: new Date(act.createdAt).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
          }));
          setRecentActivity(activities);
        }

        // Fetch orders for charts
        const ordersResponse = await ordersAPI.getAll();
        const ordersData = ordersResponse?.data?.data || ordersResponse?.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);

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
      href: '/inventory',
      alert: stats.lowStock > 0 ? `${stats.lowStock} Alertas` : null
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
      case 'proyecto':
        return FilePlus;
      case 'service':
      case 'servicio':
        return Wrench;
      case 'inventory':
      case 'inventario':
        return Boxes;
      case 'quote':
      case 'cotización':
        return Receipt;
      case 'user':
      case 'usuario':
        return UserPlus;
      default:
        return Info;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'proyecto':
        return 'text-orange-600';
      case 'cotización':
        return 'text-pink-600';
      case 'inventario':
        return 'text-green-600';
      case 'servicio':
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Resumen del sistema de gestión Eiken Design
        </p>
      </div>

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
                      {card.alert && (
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {card.alert}
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
              {!card.hideViewAll && (
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
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusChart orders={orders} />
        <TopProductsChart orders={orders} />
      </div>

      {/* Monthly Sales Chart - Full Width */}
      <div className="mt-6">
        <MonthlySalesChart orders={orders} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg mt-6 lg:mt-0">
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-red-100 text-red-800' :
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
