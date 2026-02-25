import { useState, useEffect } from 'react';
import { Shield, Users, Building2, LogOut, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ClientManagement } from './ClientManagement';
import { UserManagement } from './UserManagement';
import { LegalEntityManagement } from './LegalEntityManagement';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
  userData: any;
}

export function AdminDashboard({ onLogout, userData }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAdmins: 0,
    totalEntities: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);

      const [
        { count: totalClients },
        { count: totalAdmins },
        { count: totalEntities },
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client_admin'),
        supabase.from('legal_entities').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalClients: totalClients || 0,
        totalAdmins: totalAdmins || 0,
        totalEntities: totalEntities || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-semibold text-lg">Super Administration</h1>
                <p className="text-sm text-gray-500">Octopus Data & Privacy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Connecté : <span className="font-medium text-gray-700">{userData?.email}</span>
              </span>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      {!loadingStats && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{stats.totalClients}</span> client{stats.totalClients > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{stats.totalAdmins}</span> admin{stats.totalAdmins > 1 ? 's' : ''} client
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{stats.totalEntities}</span> entité{stats.totalEntities > 1 ? 's' : ''} juridique{stats.totalEntities > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="clients">
              <Building2 className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Users className="h-4 w-4 mr-2" />
              Admins Client
            </TabsTrigger>
            <TabsTrigger value="entities">
              <Building className="h-4 w-4 mr-2" />
              Entités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <ClientManagement
              userData={userData}
              accessToken=""
              onDataChange={loadStats}
            />
          </TabsContent>

          <TabsContent value="admins">
            <UserManagement
              userData={userData}
              accessToken=""
              onDataChange={loadStats}
            />
          </TabsContent>

          <TabsContent value="entities">
            <LegalEntityManagement
              userData={userData}
              isSuperAdmin={true}
              onDataChange={loadStats}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}