import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ClientNavbar from './components/layout/ClientNavbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Divisions from './pages/Divisions';
import Services from './pages/Services';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Users from './pages/Users';

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

// Layout principal con Navbar para admin
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

// Layout para cliente con ClientNavbar
const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <ClientNavbar />
      <main>
        {children}
      </main>
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
          path="/intranet/suppliers" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suppliers />
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
        <Route path="/suppliers" element={<Navigate to="/intranet/suppliers" />} />
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
