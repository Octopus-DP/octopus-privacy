import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboardNew } from './components/AdminDashboardNew';
import { SetupWizard } from './components/SetupWizard';
import { PasswordChangeRequired } from './components/PasswordChangeRequired';
import { FunctionalSchema } from './components/FunctionalSchema';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from 'sonner';
import { TestSupabase } from './components/TestSupabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'dashboard' | 'admin' | 'setup' | 'changePassword' | 'schema'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentClient, setCurrentClient] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    // Check if there's an existing session and if setup is needed
    const checkSession = async () => {
      // First check if admin is initialized
      try {
        console.log('Checking if setup is needed...');
        const setupCheckResponse = await fetch(`${apiUrl}/check-setup`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        console.log('Setup check response status:', setupCheckResponse.status);
        
        const setupData = await setupCheckResponse.json();
        console.log('Setup check data:', setupData);
        
        if (!setupData.isSetup) {
          console.log('Setup needed, showing setup wizard');
          setNeedsSetup(true);
          setCurrentPage('setup');
          setIsInitializing(false);
          return;
        }
        
        console.log('Setup already done, checking session...');
      } catch (error) {
        console.error('Setup check error:', error);
        // If there's an error checking setup, assume setup is needed
        console.log('Error checking setup, assuming setup needed');
        setNeedsSetup(true);
        setCurrentPage('setup');
        setIsInitializing(false);
        return;
      }

      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          console.log('Found stored token, verifying session...');
          const response = await fetch(`${apiUrl}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          const data = await response.json();
          
          if (data.success) {
            console.log('Valid session found:', data);
            setIsAuthenticated(true);
            setAccessToken(storedToken);
            setIsAdmin(data.isAdmin);
            setUserData(data.userData);
            setCurrentClient(data.isAdmin ? 'Octopus Data & Privacy' : (data.userData?.name || 'Client'));
            setCurrentPage(data.isAdmin ? 'admin' : 'dashboard');
          } else {
            console.log('Invalid session, removing token');
            localStorage.removeItem('accessToken');
          }
        } catch (error) {
          console.error('Session check error:', error);
          localStorage.removeItem('accessToken');
        }
      }
      setIsInitializing(false);
    };

    checkSession();
  }, []);

  const handleLogin = (clientName: string, token: string, admin: boolean, user: any) => {
    setIsAuthenticated(true);
    setCurrentClient(clientName);
    setAccessToken(token);
    setIsAdmin(admin);
    setUserData(user);
    
    // Check if user must change password
    if (!admin && user && user.mustChangePassword) {
      setCurrentPage('changePassword');
    } else {
      setCurrentPage(admin ? 'admin' : 'dashboard');
    }
    
    localStorage.setItem('accessToken', token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentClient('');
    setAccessToken('');
    setIsAdmin(false);
    setUserData(null);
    setCurrentPage('home');
    localStorage.removeItem('accessToken');
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
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
      {currentPage === 'setup' && (
        <SetupWizard onComplete={handleSetupComplete} />
      )}
      {currentPage === 'home' && (
        <HomePage 
          onLoginClick={() => setCurrentPage('login')}
          onSchemaClick={() => setCurrentPage('schema')}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'admin' && isAuthenticated && isAdmin && (
        <AdminDashboardNew 
          onLogout={handleLogout}
          accessToken={accessToken}
        />
      )}
      {currentPage === 'dashboard' && isAuthenticated && !isAdmin && (
        <ClientDashboard 
          clientName={currentClient}
          onLogout={handleLogout}
          userData={userData}
          accessToken={accessToken}
        />
      )}
      {currentPage === 'changePassword' && (
        <PasswordChangeRequired 
          accessToken={accessToken}
          onPasswordChanged={() => setCurrentPage('dashboard')}
        />
      )}
      {currentPage === 'schema' && (
        <FunctionalSchema onBackHome={() => setCurrentPage('home')} />
      )}
    </div>
  );
}