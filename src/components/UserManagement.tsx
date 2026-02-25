import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Mail, Shield, Filter, FileText, AlertTriangle, Fish, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  name: string;
  client_id: string;
  client_name?: string;
  role: string;
  permissions: { registre: boolean; droits: boolean; violations: boolean; phishing: boolean; };
  legal_entity_ids: string[];
  is_active: boolean;
  created_at: string;
}

interface Client { id: string; code: string; name: string; }
interface LegalEntity { id: string; client_id: string; name: string; }
interface UserManagementProps { userData: any; accessToken: string; onDataChange?: () => void; }

export function UserManagement({ userData, onDataChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', clientId: '',
    legalEntityIds: [] as string[],
    permissions: { registre: true, droits: true, violations: true, phishing: true },
  });

  useEffect(() => { loadClients(); loadLegalEntities(); loadUsers(); }, []);
  useEffect(() => { loadUsers(); }, [selectedClientId]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, code, name').eq('status', 'active').order('name');
      if (error) throw error;
      setClients(data || []);
    } catch { toast.error('Erreur lors du chargement des clients'); }
  };

  const loadLegalEntities = async () => {
    try {
      const { data, error } = await supabase.from('legal_entities').select('id, client_id, name').order('name');
      if (error) throw error;
      setLegalEntities(data || []);
    } catch (error) { console.error(error); }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('users').select(`*, clients(id, code, name)`).eq('role', 'client_admin').order('created_at', { ascending: false });
      if (selectedClientId) query = query.eq('client_id', selectedClientId);
      const { data, error } = await query;
      if (error) throw error;
      setUsers((data || []).map((u: any) => ({
        ...u,
        client_name: u.clients?.name || '',
        permissions: u.permissions || { registre: true, droits: true, violations: true, phishing: true },
        legal_entity_ids: u.legal_entity_ids || [],
      })));
    } catch { toast.error('Erreur lors du chargement des utilisateurs'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', clientId: selectedClientId || '', legalEntityIds: [], permissions: { registre: true, droits: true, violations: true, phishing: true } });
    setEditingUser(null);
  };

  const availableEntities = formData.clientId ? legalEntities.filter(e => e.client_id === formData.clientId) : [];

  const toggleEntitySelection = (entityId: string) => {
    const updated = formData.legalEntityIds.includes(entityId)
      ? formData.legalEntityIds.filter(id => id !== entityId)
      : [...formData.legalEntityIds, entityId];
    setFormData({ ...formData, legalEntityIds: updated });
  };

  const handleCreate = async () => {
    try {
      if (!formData.clientId || !formData.email || !formData.password || !formData.name) {
        toast.error('Tous les champs obligatoires doivent être remplis'); return;
      }
      setSaving(true);
      const passwordHash = await bcrypt.hash(formData.password, 10);
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const entityIds = formData.legalEntityIds.length > 0
        ? formData.legalEntityIds
        : legalEntities.filter(e => e.client_id === formData.clientId).map(e => e.id);

      const { error } = await supabase.from('users').insert([{
        id: `user_${Date.now()}`,
        email: formData.email.toLowerCase().trim(),
        name: formData.name,
        role: 'client_admin',
        client_id: formData.clientId,
        client_code: selectedClient?.code || '',
        client_name: selectedClient?.name || '',
        password_hash: passwordHash,
        is_active: true,
        permissions: formData.permissions,
        legal_entity_ids: entityIds,
        created_by: userData?.email || 'super_admin',
      }]);

      if (error) {
        if (error.code === '23505') { toast.error('Cet email est déjà utilisé'); return; }
        throw error;
      }
      toast.success('Administrateur client créé avec succès');
      setIsCreateOpen(false);
      resetForm();
      await loadUsers();
      onDataChange?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('users').update({
        name: formData.name,
        permissions: formData.permissions,
        legal_entity_ids: formData.legalEntityIds,
        updated_at: new Date().toISOString(),
      }).eq('id', editingUser.id);
      if (error) throw error;
      toast.success('Administrateur modifié avec succès');
      setIsEditOpen(false);
      setEditingUser(null);
      resetForm();
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const { error } = await supabase.from('users').update({ is_active: !user.is_active, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) throw error;
      toast.success(user.is_active ? 'Utilisateur désactivé' : 'Utilisateur activé');
      await loadUsers();
    } catch { toast.error('Erreur lors du changement de statut'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      toast.success('Utilisateur supprimé');
      await loadUsers();
      onDataChange?.();
    } catch (error: any) { toast.error(error.message || 'Erreur lors de la suppression'); }
  };

  const openEditDialog = (user: User) => {
    setIsEditOpen(true);
    setEditingUser(user);
    setFormData({ email: user.email, password: '', name: user.name, clientId: user.client_id, legalEntityIds: user.legal_entity_ids || [], permissions: { ...user.permissions } });
  };

  const PermissionsForm = () => (
    <div className="space-y-2">
      <Label>Permissions d'accès aux modules</Label>
      {[
        { key: 'registre', label: 'Registre des Traitements', desc: 'Accès au module RGPD Article 30', icon: <FileText className="h-5 w-5 text-blue-600" /> },
        { key: 'droits', label: 'Exercices de Droits', desc: 'Accès aux demandes de droits', icon: <Users className="h-5 w-5 text-green-600" /> },
        { key: 'violations', label: 'Violations de Données', desc: 'Accès au module violations', icon: <AlertTriangle className="h-5 w-5 text-orange-600" /> },
        { key: 'phishing', label: 'Tests de Phishing', desc: 'Accès aux campagnes de phishing', icon: <Fish className="h-5 w-5 text-red-600" /> },
      ].map(({ key, label, desc, icon }) => (
        <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.permissions[key as keyof typeof formData.permissions]}
            onChange={() => setFormData({ ...formData, permissions: { ...formData.permissions, [key]: !formData.permissions[key as keyof typeof formData.permissions] } })}
          />
          {icon}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </label>
      ))}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  const filteredUsers = selectedClientId ? users.filter(u => u.client_id === selectedClientId) : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold text-xl">Administrateurs Client</h2>
          <p className="text-gray-500 text-sm mt-1">{filteredUsers.length} administrateur{filteredUsers.length > 1 ? 's' : ''}{selectedClientId && ' pour ce client'}</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Filtre client — select natif */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />Nouvel administrateur
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel administrateur client</DialogTitle>
                <DialogDescription>Créez un compte Admin Client avec ses permissions et ses entités juridiques.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value, legalEntityIds: [] })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Nom complet *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jean Dupont" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jean.dupont@entreprise.fr" />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe temporaire *</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                  <p className="text-xs text-gray-500">Sera hashé avec bcrypt avant enregistrement</p>
                </div>
                {formData.clientId && (
                  <div className="space-y-2">
                    <Label>Entités juridiques accessibles</Label>
                    {availableEntities.length === 0 ? (
                      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">⚠️ Aucune entité juridique pour ce client.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Si aucune entité sélectionnée, toutes les entités du client seront assignées.</p>
                        {availableEntities.map((entity) => (
                          <label key={entity.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" checked={formData.legalEntityIds.includes(entity.id)} onChange={() => toggleEntitySelection(entity.id)} />
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{entity.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <PermissionsForm />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={saving}>{saving ? 'Création...' : "Créer l'administrateur"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 font-medium mb-2">Aucun administrateur client</h3>
            <p className="text-gray-500 text-center mb-4">{selectedClientId ? 'Aucun administrateur pour ce client' : 'Créez votre premier administrateur client'}</p>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nouvel administrateur</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const userEntities = legalEntities.filter(e => user.legal_entity_ids?.includes(e.id));
            return (
              <Card key={user.id} className={!user.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 rounded-lg p-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <CardDescription className="text-xs">{user.client_name}</CardDescription>
                      </div>
                    </div>
                    {!user.is_active && <Badge variant="outline" className="text-xs text-red-600 border-red-200">Inactif</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{user.email}</span>
                  </div>
                  {userEntities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {userEntities.map(e => <Badge key={e.id} variant="outline" className="text-xs">{e.name}</Badge>)}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {user.permissions?.registre && <Badge variant="secondary" className="text-xs">Registre</Badge>}
                    {user.permissions?.droits && <Badge variant="secondary" className="text-xs">Droits</Badge>}
                    {user.permissions?.violations && <Badge variant="secondary" className="text-xs">Violations</Badge>}
                    {user.permissions?.phishing && <Badge variant="secondary" className="text-xs">Phishing</Badge>}
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Dialog open={isEditOpen && editingUser?.id === user.id} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditingUser(null); } }}>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(user)}>
                        <Pencil className="h-4 w-4 mr-1" />Modifier
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier l'administrateur</DialogTitle>
                          <DialogDescription>Modifiez le nom, les permissions et les entités accessibles.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Nom complet *</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Email (non modifiable)</Label>
                            <Input value={formData.email} disabled className="bg-gray-50" />
                          </div>
                          <div className="space-y-2">
                            <Label>Entités juridiques accessibles</Label>
                            {legalEntities.filter(e => e.client_id === formData.clientId).map((entity) => (
                              <label key={entity.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" checked={formData.legalEntityIds.includes(entity.id)} onChange={() => toggleEntitySelection(entity.id)} />
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{entity.name}</span>
                              </label>
                            ))}
                          </div>
                          <PermissionsForm />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingUser(null); }}>Annuler</Button>
                          <Button onClick={handleUpdate} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(user)} title={user.is_active ? 'Désactiver' : 'Activer'}>
                      <Shield className={`h-4 w-4 ${user.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'administrateur ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible. L'utilisateur ne pourra plus se connecter.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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