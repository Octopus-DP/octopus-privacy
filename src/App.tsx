import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from 'sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'admin'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restaurer la session depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUserData(user);
        setCurrentPage(user.role === 'super_admin' ? 'admin' : 'dashboard');
      } catch (e) {
        // Session corrompue → on nettoie
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }

    setIsInitializing(false);
  }, []);

  const handleLogin = (user: any, token: string) => {
    setIsAuthenticated(true);
    setUserData(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setCurrentPage(user.role === 'super_admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setCurrentPage('login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentPage === 'admin' && isAuthenticated && userData?.role === 'super_admin' && (
        <AdminDashboard
          onLogout={handleLogout}
          userData={userData}
        />
      )}

      {currentPage === 'dashboard' && isAuthenticated && userData?.role !== 'super_admin' && (
        <ClientDashboard
          clientName={userData?.client_name || ''}
          onLogout={handleLogout}
          userData={userData}
          accessToken={localStorage.getItem('authToken') || ''}
        />
      )}
    </div>
  );
}