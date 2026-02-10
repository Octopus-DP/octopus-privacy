import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, Mail, Shield, Building2, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface User {
  id: string;
  email: string;
  name: string;
  clientId: string;
  permissions: {
    registre: boolean;
    droits: boolean;
    violations: boolean;
    phishing: boolean;
  };
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

interface UserManagementProps {
  users: User[];
  clients: Client[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string) => void;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function UserManagement({ 
  users, 
  clients, 
  selectedClientId,
  onClientSelect,
  onCreate, 
  onUpdate, 
  onDelete 
}: UserManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    clientId: '',
    permissions: {
      registre: true,
      droits: true,
      violations: true,
      phishing: true,
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      clientId: selectedClientId || '',
      permissions: {
        registre: true,
        droits: true,
        violations: true,
        phishing: true,
      },
    });
    setEditingUser(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.clientId) {
        alert('Veuillez sélectionner un client');
        return;
      }
      await onCreate(formData);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await onUpdate(editingUser.id, {
        name: formData.name,
        permissions: formData.permissions,
      });
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      clientId: user.clientId,
      permissions: { ...user.permissions },
    });
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  const filteredUsers = selectedClientId 
    ? users.filter(user => user.clientId === selectedClientId)
    : users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestion des Administrateurs Client</h2>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} administrateur{filteredUsers.length > 1 ? 's' : ''} 
            {selectedClientId && ' pour ce client'}
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedClientId || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                onClientSelect('');
              } else {
                onClientSelect(value);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tous les clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel administrateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvel administrateur client</DialogTitle>
                <DialogDescription>
                  Créez un administrateur client avec accès complet à tous les registres et entités.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@entreprise.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-900">Administrateur Client</p>
                  </div>
                  <p className="text-xs text-blue-700">
                    Cet utilisateur aura automatiquement accès à :
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                    <li>• Tous les registres RGPD (Traitements, Droits, Violations)</li>
                    <li>• Toutes les entités juridiques du client</li>
                    <li>• La gestion des utilisateurs de son organisation</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate}>
                  Créer l'utilisateur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">Aucun administrateur client</h3>
            <p className="text-gray-600 text-center mb-4">
              {selectedClientId 
                ? 'Aucun administrateur client pour ce client'
                : 'Commencez par créer un administrateur client'}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel administrateur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>
                        {getClientName(user.clientId)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Accès autorisés :</p>
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.registre && (
                      <Badge variant="secondary">Registre</Badge>
                    )}
                    {user.permissions.droits && (
                      <Badge variant="secondary">Droits</Badge>
                    )}
                    {user.permissions.violations && (
                      <Badge variant="secondary">Violations</Badge>
                    )}
                    {user.permissions.phishing && (
                      <Badge variant="secondary">Phishing</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Modifier l'administrateur client</DialogTitle>
                        <DialogDescription>
                          Modifiez le nom de l'administrateur client.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Nom complet *</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email (non modifiable)</Label>
                          <Input
                            id="edit-email"
                            value={formData.email}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex gap-2 mb-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <p className="text-sm text-blue-900">Administrateur Client</p>
                          </div>
                          <p className="text-xs text-blue-700">
                            Cet utilisateur a automatiquement accès à :
                          </p>
                          <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                            <li>• Tous les registres RGPD (Traitements, Droits, Violations)</li>
                            <li>• Toutes les entités juridiques du client</li>
                            <li>• La gestion des utilisateurs de son organisation</li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                          Annuler
                        </Button>
                        <Button onClick={handleUpdate}>
                          Enregistrer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L'utilisateur ne pourra plus se connecter.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}