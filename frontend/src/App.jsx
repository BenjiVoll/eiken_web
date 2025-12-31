import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import ClientNavbar from '@/components/layout/ClientNavbar';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Categories from '@/pages/Categories';
import Divisions from '@/pages/Divisions';
import Services from '@/pages/Services';
import Inventory from '@/pages/Inventory';

import Projects from '@/pages/Projects';
import Quotes from '@/pages/Quotes';
import Users from '@/pages/Users';
import Store from '@/pages/Store';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import Checkout from '@/pages/Checkout';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailure from '@/pages/PaymentFailure';
import PaymentPending from '@/pages/PaymentPending';


const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, loggingOut } = useAuth();

  if (loading || loggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}>
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

import WhatsAppButton from '@/components/layout/WhatsAppButton';

const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <ClientNavbar />
      <main>
        {children}
      </main>
      <WhatsAppButton />
    </div>
  );
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ClientLayout>
              <Home />
            </ClientLayout>
          }
        />
        <Route
          path="/store"
          element={<Store />}
        />

        <Route
          path="/checkout"
          element={
            <ClientLayout>
              <Checkout />
            </ClientLayout>
          }
        />

        <Route
          path="/payment/success"
          element={
            <ClientLayout>
              <PaymentSuccess />
            </ClientLayout>
          }
        />

        <Route
          path="/payment/failure"
          element={
            <ClientLayout>
              <PaymentFailure />
            </ClientLayout>
          }
        />

        <Route
          path="/payment/pending"
          element={
            <ClientLayout>
              <PaymentPending />
            </ClientLayout>
          }
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/intranet/dashboard" /> : <Login />}
        />

        <Route
          path="/intranet"
          element={<Navigate to="/intranet/dashboard" replace />}
        />

        <Route
          path="/intranet/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/intranet/services"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Services />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/intranet/categories"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Categories />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/intranet/divisions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Divisions />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/intranet/inventory"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Inventory />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/intranet/products"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Products />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/intranet/orders"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Orders />
              </AppLayout>
            </ProtectedRoute>
          }
        />



        <Route
          path="/intranet/projects"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/intranet/quotes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Quotes />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/intranet/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/intranet/dashboard" />} />
        <Route path="/services" element={<Navigate to="/intranet/services" />} />
        <Route path="/inventory" element={<Navigate to="/intranet/inventory" />} />
        <Route path="/products" element={<Navigate to="/intranet/products" />} />

        <Route path="/projects" element={<Navigate to="/intranet/projects" />} />
        <Route path="/quotes" element={<Navigate to="/intranet/quotes" />} />
        <Route path="/users" element={<Navigate to="/intranet/users" />} />

        <Route path="/admin/*" element={<Navigate to="/intranet" />} />
        <Route path="/gestion/*" element={<Navigate to="/intranet" />} />

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="text-gray-600 mt-2">Página no encontrada</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
