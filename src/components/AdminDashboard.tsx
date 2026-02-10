import { useState, useEffect } from 'react';
import { Shield, Users, Building2, LogOut, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ClientManagement } from './ClientManagement';
import { UserManagement } from './UserManagement';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminDashboardProps {
  onLogout: () => void;
  accessToken: string;
}

export function AdminDashboard({ onLogout, accessToken }: AdminDashboardProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  const fetchClients = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/clients`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchUsers = async (clientId?: string) => {
    try {
      const url = clientId 
        ? `${apiUrl}/admin/users?clientId=${clientId}`
        : `${apiUrl}/admin/users`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchClients(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    fetchUsers(clientId);
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      const response = await fetch(`${apiUrl}/admin/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchClients();
        return data.client;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const handleUpdateClient = async (clientId: string, updates: any) => {
    try {
      const response = await fetch(`${apiUrl}/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        await fetchClients();
      }
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        await fetchClients();
        if (selectedClientId === clientId) {
          setSelectedClientId(null);
          fetchUsers();
        }
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchUsers(selectedClientId || undefined);
        return data.user;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`${apiUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        await fetchUsers(selectedClientId || undefined);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        await fetchUsers(selectedClientId || undefined);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  if (loading) {
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">Octopus Data & Privacy</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="clients">
              <Building2 className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Administrateurs client
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <ClientManagement
              clients={clients}
              onCreate={handleCreateClient}
              onUpdate={handleUpdateClient}
              onDelete={handleDeleteClient}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement
              users={users}
              clients={clients}
              selectedClientId={selectedClientId}
              onClientSelect={handleClientSelect}
              onCreate={handleCreateUser}
              onUpdate={handleUpdateUser}
              onDelete={handleDeleteUser}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}