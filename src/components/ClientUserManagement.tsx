import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Mail, Shield, Building2, FileText, AlertTriangle, User as UserIcon, Eye, EyeOff, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface ClientUserManagementProps {
  userData?: any;
  accessToken?: string;
  legalEntities: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client_admin' | 'user';
  permissions: {
    registre: boolean;
    droits: boolean;
    violations: boolean;
    phishing: boolean;
  };
  legalEntityIds: string[];
  clientCode: string;
  invitedAt?: string;
  activatedAt?: string;
}

export function ClientUserManagement({ userData, accessToken, legalEntities }: ClientUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'client_admin' | 'user',
    permissions: {
      registre: true,
      droits: true,
      violations: true,
      phishing: true,
    },
    legalEntityIds: [] as string[],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/client-admin/users`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Le nom et l\'email sont requis');
      return;
    }

    if (formData.legalEntityIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une entité juridique');
      return;
    }

    try {
      console.log('Creating user with data:', formData);
      
      const response = await fetch(`${apiUrl}/client-admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (formData.legalEntityIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une entité juridique');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/client-admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          role: formData.role,
          permissions: formData.permissions,
          legalEntityIds: formData.legalEntityIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      toast.success('Utilisateur mis à jour avec succès');
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/client-admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('Utilisateur supprimé avec succès');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleSendInvitation = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/client-admin/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast.success('Invitation envoyée avec succès');
      loadUsers();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      permissions: {
        registre: true,
        droits: true,
        violations: true,
        phishing: true,
      },
      legalEntityIds: [],
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      legalEntityIds: user.legalEntityIds,
    });
  };

  const togglePermission = (permission: 'registre' | 'droits' | 'violations' | 'phishing') => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission],
      },
    });
  };

  const toggleLegalEntity = (entityId: string) => {
    const isSelected = formData.legalEntityIds.includes(entityId);
    setFormData({
      ...formData,
      legalEntityIds: isSelected
        ? formData.legalEntityIds.filter(id => id !== entityId)
        : [...formData.legalEntityIds, entityId],
    });
  };

  const toggleAllLegalEntities = () => {
    const allSelected = formData.legalEntityIds.length === legalEntities.length;
    setFormData({
      ...formData,
      legalEntityIds: allSelected ? [] : legalEntities.map(e => e.id),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les utilisateurs et leurs accès aux registres et entités
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Accès Registres
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Entités
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur pour le moment
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          user.role === 'client_admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {user.role === 'client_admin' ? 'Admin Client' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {user.permissions.registre && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Traitements
                          </span>
                        )}
                        {user.permissions.droits && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Droits
                          </span>
                        )}
                        {user.permissions.violations && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Violations
                          </span>
                        )}
                        {user.permissions.phishing && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Phishing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {user.legalEntityIds.length === legalEntities.length
                          ? 'Toutes'
                          : `${user.legalEntityIds.length} entité(s)`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {user.activatedAt ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          Activé
                        </span>
                      ) : user.invitedAt ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                          Invité
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!user.invitedAt && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendInvitation(user.id)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-gray-900">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name and Email (only for new users) */}
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="jean.dupont@example.com"
                    />
                  </div>
                </>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Rôle <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="client_admin"
                      checked={formData.role === 'client_admin'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client_admin' | 'user' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Administrateur Client</p>
                      <p className="text-xs text-gray-500">Accès complet et peut gérer les autres utilisateurs</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client_admin' | 'user' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Utilisateur Standard</p>
                      <p className="text-xs text-gray-500">Accès limité selon les permissions définies</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Permissions (only for standard users) */}
              {formData.role === 'user' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Accès aux Registres <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.registre}
                        onChange={() => togglePermission('registre')}
                      />
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-900">Registre des Traitements</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.droits}
                        onChange={() => togglePermission('droits')}
                      />
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-900">Exercices de Droits</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.violations}
                        onChange={() => togglePermission('violations')}
                      />
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-gray-900">Violations de Données</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.phishing}
                        onChange={() => togglePermission('phishing')}
                      />
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-gray-900">Phishing</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Legal Entities */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Entités Juridiques <span className="text-red-500">*</span>
                </label>
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={toggleAllLegalEntities}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {formData.legalEntityIds.length === legalEntities.length
                      ? 'Désélectionner tout'
                      : 'Sélectionner tout'}
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {legalEntities.map((entity) => (
                    <label
                      key={entity.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.legalEntityIds.includes(entity.id)}
                        onChange={() => toggleLegalEntity(entity.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{entity.name}</p>
                        {entity.siren && (
                          <p className="text-xs text-gray-500">SIREN: {entity.siren}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={editingUser ? handleUpdateUser : handleCreateUser}>
                <Save className="h-4 w-4 mr-2" />
                {editingUser ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}