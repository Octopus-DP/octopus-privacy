import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface LegalEntity {
  id: string;
  client_id: string;
  client_code: string;
  name: string;
  legal_form?: string;
  siren?: string;
  siret?: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_primary: boolean;
  created_at: string;
}

interface Client {
  id: string;
  code: string;
  name: string;
}

interface LegalEntityManagementProps {
  userData: any;
  isSuperAdmin?: boolean;
  onDataChange?: () => void;
}

export function LegalEntityManagement({ userData, isSuperAdmin = false, onDataChange }: LegalEntityManagementProps) {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    legal_form: '',
    siren: '',
    siret: '',
    address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    is_primary: false,
  });

  useEffect(() => {
    if (isSuperAdmin) loadClients();
    loadEntities();
  }, []);

  useEffect(() => {
    loadEntities();
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, code, name').eq('status', 'active').order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des clients');
    }
  };

  const loadEntities = async () => {
    try {
      setLoading(true);
      let query = supabase.from('legal_entities').select(`*, clients(id, code, name)`).order('name', { ascending: true });
      if (isSuperAdmin) {
        if (selectedClient) query = query.eq('client_id', selectedClient);
      } else {
        query = query.eq('client_id', userData.client_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des entités');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: isSuperAdmin ? '' : userData.client_id,
      name: '', legal_form: '', siren: '', siret: '',
      address: '', contact_name: '', contact_email: '', contact_phone: '',
      is_primary: false,
    });
    setEditingEntity(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.client_id || !formData.name) {
        toast.error('Le client et le nom sont requis');
        return;
      }
      setSaving(true);
      const selectedClientData = clients.find(c => c.id === formData.client_id);

      if (editingEntity) {
        const { error } = await supabase.from('legal_entities').update({
          name: formData.name,
          legal_form: formData.legal_form || null,
          siren: formData.siren || null,
          siret: formData.siret || null,
          address: formData.address || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          is_primary: formData.is_primary,
          updated_at: new Date().toISOString(),
        }).eq('id', editingEntity.id);
        if (error) throw error;
        toast.success('Entité modifiée avec succès');
      } else {
        const { error } = await supabase.from('legal_entities').insert([{
          id: `entity_${Date.now()}`,
          client_id: formData.client_id,
          client_code: selectedClientData?.code || userData?.client_code || '',
          name: formData.name,
          legal_form: formData.legal_form || null,
          siren: formData.siren || null,
          siret: formData.siret || null,
          address: formData.address || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          is_primary: formData.is_primary,
          created_by: userData?.email || 'system',
        }]);
        if (error) {
          if (error.code === '23505') { toast.error('Cette entité existe déjà'); return; }
          throw error;
        }
        toast.success('Entité créée avec succès');
      }
      setShowDialog(false);
      resetForm();
      await loadEntities();
      onDataChange?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('legal_entities').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') { toast.error('Impossible de supprimer : des données sont associées à cette entité'); return; }
        throw error;
      }
      toast.success('Entité supprimée');
      await loadEntities();
      onDataChange?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const openEditDialog = (entity: LegalEntity) => {
    setEditingEntity(entity);
    setFormData({
      client_id: entity.client_id,
      name: entity.name,
      legal_form: entity.legal_form || '',
      siren: entity.siren || '',
      siret: entity.siret || '',
      address: entity.address || '',
      contact_name: entity.contact_name || '',
      contact_email: entity.contact_email || '',
      contact_phone: entity.contact_phone || '',
      is_primary: entity.is_primary,
    });
    setShowDialog(true);
  };

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || '';

  const filteredEntities = isSuperAdmin && selectedClient
    ? entities.filter(e => e.client_id === selectedClient)
    : entities;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold text-xl">Entités Juridiques</h2>
          <p className="text-gray-500 text-sm mt-1">{filteredEntities.length} entité{filteredEntities.length > 1 ? 's' : ''} juridique{filteredEntities.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3 items-center">
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entité
          </Button>
        </div>
      </div>

      {filteredEntities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 font-medium mb-2">Aucune entité juridique</h3>
            <p className="text-gray-500 text-center mb-4">{selectedClient ? 'Aucune entité pour ce client' : 'Créez votre première entité juridique'}</p>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />Nouvelle entité
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntities.map((entity) => (
            <Card key={entity.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-lg p-2 shrink-0">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{entity.name}</CardTitle>
                    {isSuperAdmin && <CardDescription className="text-xs">{getClientName(entity.client_id)}</CardDescription>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {entity.legal_form && <p className="text-sm text-gray-600"><span className="text-gray-400">Forme :</span> {entity.legal_form}</p>}
                {entity.siren && <p className="text-sm text-gray-600"><span className="text-gray-400">SIREN :</span> <span className="font-mono">{entity.siren}</span></p>}
                {entity.siret && <p className="text-sm text-gray-600"><span className="text-gray-400">SIRET :</span> <span className="font-mono">{entity.siret}</span></p>}
                {entity.address && <p className="text-sm text-gray-600 truncate"><span className="text-gray-400">Adresse :</span> {entity.address}</p>}
                {entity.is_primary && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">Entité principale</Badge>}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(entity)}>
                    <Pencil className="h-4 w-4 mr-2" />Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'entité ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Toutes les données liées à cette entité seront supprimées.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(entity.id)} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntity ? "Modifier l'entité juridique" : 'Nouvelle entité juridique'}</DialogTitle>
            <DialogDescription>{editingEntity ? "Modifiez les informations de l'entité" : 'Créez une nouvelle entité juridique'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isSuperAdmin && !editingEntity && (
              <div className="space-y-2">
                <Label>Client *</Label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l'entité *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Acme Corporation" />
              </div>
              <div className="space-y-2">
                <Label>Forme juridique</Label>
                <Input value={formData.legal_form} onChange={(e) => setFormData({ ...formData, legal_form: e.target.value })} placeholder="SAS, SARL, SA..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SIREN</Label>
                <Input value={formData.siren} onChange={(e) => setFormData({ ...formData, siren: e.target.value })} placeholder="123 456 789" maxLength={9} />
              </div>
              <div className="space-y-2">
                <Label>SIRET</Label>
                <Input value={formData.siret} onChange={(e) => setFormData({ ...formData, siret: e.target.value })} placeholder="123 456 789 00012" maxLength={14} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Rue de la République, 75001 Paris" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du contact</Label>
                <Input value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} placeholder="Jean Dupont" />
              </div>
              <div className="space-y-2">
                <Label>Email du contact</Label>
                <Input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} placeholder="contact@acme.fr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} placeholder="+33 1 23 45 67 89" />
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={formData.is_primary} onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })} className="rounded border-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900">Entité principale</p>
                <p className="text-xs text-gray-500">Entité juridique principale du client</p>
              </div>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Enregistrement...' : editingEntity ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}