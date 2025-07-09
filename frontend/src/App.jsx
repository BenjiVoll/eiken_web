import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Users from './pages/Users';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
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

// Layout principal con Navbar
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

// Componente principal de la aplicación
function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Services />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Inventory />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/suppliers" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Suppliers />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/quotes" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Quotes />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Ruta 404 */}
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
