import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, Mail, Send, CheckSquare, Square, FileText, AlertTriangle, Fish } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  clientId: string;
  legalEntityIds: string[];
  permissions: {
    registre: boolean;
    droits: boolean;
    violations: boolean;
    phishing: boolean;
  };
  activatedAt?: string;
  invitedAt?: string;
  mustChangePassword: boolean;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

interface LegalEntity {
  id: string;
  clientId: string;
  name: string;
}

interface UserManagementProps {
  users: User[];
  clients: Client[];
  legalEntities: LegalEntity[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string) => void;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSendInvitations: (userIds: string[]) => Promise<void>;
  accessToken: string;
}

export function UserManagementNew({ 
  users, 
  clients,
  legalEntities,
  selectedClientId,
  onClientSelect,
  onCreate, 
  onUpdate, 
  onDelete,
  onSendInvitations,
  accessToken
}: UserManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    clientId: '',
    legalEntityIds: [] as string[],
    permissions: {
      registre: true,
      droits: true,
      violations: true,
      phishing: true,
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      clientId: '',
      legalEntityIds: [],
      permissions: {
        registre: true,
        droits: true,
        violations: true,
        phishing: true,
      },
    });
    setEditingUser(null);
    setError('');
  };

  const handleCreate = async () => {
    try {
      setError('');
      await onCreate(formData);
      setIsCreateOpen(false);
      resetForm();
      setSuccess('Administrateur créé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Erreur lors de la création de l\'administrateur');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      setError('');
      await onUpdate(editingUser.id, formData);
      setEditingUser(null);
      resetForm();
      setSuccess('Administrateur modifié avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Erreur lors de la modification de l\'administrateur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      setSuccess('Utilisateur supprimé');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      clientId: user.clientId,
      legalEntityIds: user.legalEntityIds || [],
      permissions: user.permissions,
    });
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSendInvitations = async () => {
    if (selectedUsers.size === 0) {
      alert('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/admin/send-invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: Array.from(selectedUsers) }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.emailsSent) {
          alert(`✅ ${data.message}\n\nLes emails ont été envoyés avec succès.`);
        } else {
          alert(`⚠️ ${data.message}\n\n📧 Configuration Mailjet requise !\n\nLes utilisateurs ont été marqués comme "invités", mais aucun email n'a été envoyé car Mailjet n'est pas configuré.\n\nConsultez le fichier CONFIGURATION_MAILJET.md pour configurer l'envoi d'emails.`);
        }
        setSelectedUsers(new Set());
        // Trigger parent to reload users
        await onSendInvitations(Array.from(selectedUsers));
      } else {
        alert('Erreur lors de l\'envoi des invitations : ' + data.error);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Erreur lors de l\'envoi des invitations');
    }
  };

  const toggleEntitySelection = (entityId: string) => {
    const newEntities = formData.legalEntityIds.includes(entityId)
      ? formData.legalEntityIds.filter(id => id !== entityId)
      : [...formData.legalEntityIds, entityId];
    setFormData({ ...formData, legalEntityIds: newEntities });
  };

  const filteredUsers = selectedClientId
    ? users.filter(u => u.clientId === selectedClientId)
    : users;

  const availableEntities = formData.clientId
    ? legalEntities.filter(e => e.clientId === formData.clientId)
    : [];

  // Debug logs
  console.log('UserManagementNew - Total legal entities:', legalEntities.length);
  console.log('UserManagementNew - Selected clientId:', formData.clientId);
  console.log('UserManagementNew - Available entities for this client:', availableEntities.length);
  if (formData.clientId) {
    console.log('Legal entities details:', legalEntities);
    console.log('Filtered entities:', availableEntities);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestion des Administrateurs Client</h2>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} administrateur{filteredUsers.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.size > 0 && (
            <Button
              variant="outline"
              onClick={handleSendInvitations}
              disabled={sendingInvitations}
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer invitations ({selectedUsers.size})
            </Button>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel administrateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvel administrateur client</DialogTitle>
                <DialogDescription>
                  Créez un administrateur client avec accès complet à tous les registres et entités.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-4">
                {/* Client */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <select
                    id="clientId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value, legalEntityIds: [] })}
                    required
                  >
                    <option value="">Sélectionnez un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@exemple.fr"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe temporaire *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    L'utilisateur devra le changer à sa première connexion
                  </p>
                </div>

                {/* Permissions */}
                <div className="space-y-3">
                  <Label>Permissions de l'administrateur</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.registre}
                        onChange={() => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            registre: !formData.permissions.registre
                          }
                        })}
                      />
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Registre des Traitements</p>
                        <p className="text-xs text-gray-500">Accès au module de gestion des traitements</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.droits}
                        onChange={() => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            droits: !formData.permissions.droits
                          }
                        })}
                      />
                      <Users className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Exercices de Droits</p>
                        <p className="text-xs text-gray-500">Accès aux demandes d'exercice de droits</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.violations}
                        onChange={() => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            violations: !formData.permissions.violations
                          }
                        })}
                      />
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Violations de Données</p>
                        <p className="text-xs text-gray-500">Accès au module de gestion des violations</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.phishing}
                        onChange={() => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            phishing: !formData.permissions.phishing
                          }
                        })}
                      />
                      <Fish className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Tests de Phishing</p>
                        <p className="text-xs text-gray-500">Accès au module de campagnes de phishing</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Admin info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-900">Administrateur Client</p>
                  </div>
                  <p className="text-xs text-blue-700">
                    En tant qu'administrateur, cet utilisateur aura également :
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                    <li>• Accès à toutes les entités juridiques du client</li>
                    <li>• Gestion des utilisateurs de son organisation</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate}>
                  Créer l'administrateur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      {error && !isCreateOpen && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter-client">Filtrer par client</Label>
          <select
            id="filter-client"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            value={selectedClientId || ''}
            onChange={(e) => onClientSelect(e.target.value)}
          >
            <option value="">Tous les clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Select All */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded"
          >
            {selectedUsers.size === filteredUsers.length ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : (
              <Square className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm font-medium">
              Tout sélectionner ({filteredUsers.length})
            </span>
          </button>
        </div>
      )}

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">Aucun administrateur client</h3>
            <p className="text-gray-600 text-center mb-4">
              Commencez par créer votre premier administrateur client
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel administrateur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const userEntities = legalEntities.filter(e => user.legalEntityIds?.includes(e.id));
            const client = clients.find(c => c.id === user.clientId);
            
            return (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleUserSelection(user.id)}
                      className="mt-1"
                    >
                      {selectedUsers.has(user.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">{client?.name}</p>
                          {userEntities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {userEntities.map(entity => (
                                <Badge key={entity.id} variant="outline" className="text-xs">
                                  {entity.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Modifier l'administrateur client</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations de l'administrateur client.
                                </DialogDescription>
                              </DialogHeader>
                              {error && (
                                <Alert variant="destructive">
                                  <AlertDescription>{error}</AlertDescription>
                                </Alert>
                              )}
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nom complet *</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">Email (non modifiable)</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-gray-50"
                                  />
                                </div>
                                {/* Permissions */}
                                <div className="space-y-3">
                                  <Label>Permissions de l'administrateur</Label>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.registre}
                                        onChange={() => setFormData({
                                          ...formData,
                                          permissions: {
                                            ...formData.permissions,
                                            registre: !formData.permissions.registre
                                          }
                                        })}
                                      />
                                      <FileText className="h-5 w-5 text-blue-600" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">Registre des Traitements</p>
                                        <p className="text-xs text-gray-500">Accès au module de gestion des traitements</p>
                                      </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.droits}
                                        onChange={() => setFormData({
                                          ...formData,
                                          permissions: {
                                            ...formData.permissions,
                                            droits: !formData.permissions.droits
                                          }
                                        })}
                                      />
                                      <Users className="h-5 w-5 text-green-600" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">Exercices de Droits</p>
                                        <p className="text-xs text-gray-500">Accès aux demandes d'exercice de droits</p>
                                      </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.violations}
                                        onChange={() => setFormData({
                                          ...formData,
                                          permissions: {
                                            ...formData.permissions,
                                            violations: !formData.permissions.violations
                                          }
                                        })}
                                      />
                                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">Violations de Données</p>
                                        <p className="text-xs text-gray-500">Accès au module de gestion des violations</p>
                                      </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.phishing}
                                        onChange={() => setFormData({
                                          ...formData,
                                          permissions: {
                                            ...formData.permissions,
                                            phishing: !formData.permissions.phishing
                                          }
                                        })}
                                      />
                                      <Fish className="h-5 w-5 text-red-600" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">Tests de Phishing</p>
                                        <p className="text-xs text-gray-500">Accès au module de campagnes de phishing</p>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                                
                                {/* Admin info box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex gap-2 mb-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <p className="text-sm text-blue-900">Administrateur Client</p>
                                  </div>
                                  <p className="text-xs text-blue-700">
                                    En tant qu'administrateur, cet utilisateur a également :
                                  </p>
                                  <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                                    <li>• Accès à toutes les entités juridiques du client</li>
                                    <li>• Gestion des utilisateurs de son organisation</li>
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
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible.
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
                      </div>

                      {/* Permissions & Status */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.permissions.registre && <Badge variant="secondary" className="text-xs">Registre</Badge>}
                        {user.permissions.droits && <Badge variant="secondary" className="text-xs">Droits</Badge>}
                        {user.permissions.violations && <Badge variant="secondary" className="text-xs">Violations</Badge>}
                        {user.permissions.phishing && <Badge variant="secondary" className="text-xs">Phishing</Badge>}
                        {user.activatedAt && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Activé le {new Date(user.activatedAt).toLocaleDateString('fr-FR')}
                          </Badge>
                        )}
                        {user.invitedAt && !user.activatedAt && (
                          <Badge className="text-xs bg-amber-100 text-amber-800">
                            Invité le {new Date(user.invitedAt).toLocaleDateString('fr-FR')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}