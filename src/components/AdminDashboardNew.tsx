import { useState, useEffect } from 'react';
import { Shield, Users, Building2, LogOut, Building, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ClientManagement } from './ClientManagement';
import { LegalEntityManagement } from './LegalEntityManagement';
import { UserManagementNew } from './UserManagementNew';
import { PerformanceSettings } from './PerformanceSettings';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminDashboardProps {
  onLogout: () => void;
  accessToken: string;
}

export function AdminDashboardNew({ onLogout, accessToken }: AdminDashboardProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [legalEntities, setLegalEntities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  const fetchLegalEntities = async () => {
    try {
      const response = await fetch(`${apiUrl}/legal-entities`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLegalEntities(data.entities);
      }
    } catch (error) {
      console.error('Error fetching legal entities:', error);
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
      await Promise.all([fetchClients(), fetchLegalEntities(), fetchUsers()]);
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
        await fetchUsers();
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
        await fetchUsers();
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
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const handleSendInvitations = async (userIds: string[]) => {
    try {
      const response = await fetch(`${apiUrl}/admin/send-invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">Octopus Data & Privacy</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  if (!confirm('Voulez-vous migrer tous les utilisateurs pour ajouter les rôles manquants ?')) return;
                  try {
                    const response = await fetch(`${apiUrl}/admin/migrate-user-roles`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                      },
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert(`Migration réussie ! ${data.updatedUsers} utilisateurs mis à jour.`);
                    } else {
                      alert('Erreur : ' + data.error);
                    }
                  } catch (error) {
                    console.error('Migration error:', error);
                    alert('Erreur lors de la migration');
                  }
                }}
              >
                🔧 Migrer Rôles
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const email = prompt('Email de l\'utilisateur à debugger:');
                  if (!email) return;
                  try {
                    const response = await fetch(`${apiUrl}/debug/user/${encodeURIComponent(email)}`, {
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                      },
                    });
                    const data = await response.json();
                    if (data.success) {
                      console.log('User data:', data.userData);
                      alert(JSON.stringify(data.userData, null, 2));
                    } else {
                      alert('Erreur : ' + data.error);
                    }
                  } catch (error) {
                    console.error('Debug error:', error);
                    alert('Erreur lors du debug');
                  }
                }}
              >
                🔍 Debug User
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const email = prompt('Email de l\'utilisateur:');
                  if (!email) return;
                  const clientId = prompt('ID du client (visible dans Debug User):');
                  if (!clientId) return;
                  
                  if (!confirm(`Corriger le client de ${email} vers ${clientId} ?`)) return;
                  
                  try {
                    const response = await fetch(`${apiUrl}/debug/fix-user-client`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ email, clientId }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert('✅ Client corrigé ! L\'utilisateur doit se reconnecter.');
                    } else {
                      alert('Erreur : ' + data.error);
                    }
                  } catch (error) {
                    console.error('Fix error:', error);
                    alert('Erreur lors de la correction');
                  }
                }}
              >
                🔧 Fix User Client
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <PerformanceSettings accessToken={accessToken} />
        ) : (
          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="clients" className="gap-2">
                <Building2 className="h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="entities" className="gap-2">
                <Building className="h-4 w-4" />
                Entités
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Administrateurs client
              </TabsTrigger>
            </TabsList>

            {/* Clients Tab */}
            <TabsContent value="clients">
              <ClientManagement
                clients={clients}
                onCreate={handleCreateClient}
                onUpdate={handleUpdateClient}
                onDelete={handleDeleteClient}
              />
            </TabsContent>

            {/* Legal Entities Tab */}
            <TabsContent value="entities">
              <LegalEntityManagement
                accessToken={accessToken}
                clients={clients}
                onEntitiesChange={fetchLegalEntities}
              />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <UserManagementNew
                users={users}
                clients={clients}
                legalEntities={legalEntities}
                selectedClientId={selectedClientId}
                onClientSelect={handleClientSelect}
                onCreate={handleCreateUser}
                onUpdate={handleUpdateUser}
                onDelete={handleDeleteUser}
                onSendInvitations={handleSendInvitations}
                accessToken={accessToken}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}