import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
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
  accessToken: string;
  userData: any;
}

export function LegalEntityManagement({ accessToken, userData }: LegalEntityManagementProps) {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null);
  const [selectedClient, setSelectedClient] = useState('');

  // Form state
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
    loadClients();
    loadEntities();
  }, []);

  useEffect(() => {
    loadEntities();
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, code, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Erreur lors du chargement des clients');
    }
  };

  const loadEntities = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('legal_entities')
        .select(`
          *,
          clients (
            id,
            code,
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Filtrer par client si sélectionné
      if (selectedClient) {
        query = query.eq('client_id', selectedClient);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error('Error loading entities:', error);
      toast.error('Erreur lors du chargement des entités');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingEntity(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.client_id || !formData.name) {
        toast.error('Le client et le nom sont requis');
        return;
      }

      // Trouver le client sélectionné
      const selectedClientData = clients.find(c => c.id === formData.client_id);

      if (editingEntity) {
        // UPDATE
        const { error } = await supabase
          .from('legal_entities')
          .update({
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
          })
          .eq('id', editingEntity.id);

        if (error) throw error;
        toast.success('Entité modifiée avec succès');
      } else {
        // INSERT
        const entityId = `entity_${Date.now()}`;
        
        const entityData = {
          id: entityId,
          client_id: formData.client_id,
          client_code: selectedClientData?.code || '',
          name: formData.name,
          legal_form: formData.legal_form || null,
          siren: formData.siren || null,
          siret: formData.siret || null,
          address: formData.address || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          is_primary: formData.is_primary,
          created_by: (userData && userData.email) ? userData.email : 'system',
        };

        const { error } = await supabase
          .from('legal_entities')
          .insert([entityData]);

        if (error) {
          if (error.code === '23505') { // Unique violation
            toast.error('Cette entité existe déjà');
          } else {
            throw error;
          }
          return;
        }

        toast.success('Entité créée avec succès');
      }

      setShowDialog(false);
      resetForm();
      await loadEntities();
    } catch (error: any) {
      console.error('Error saving entity:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('legal_entities')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          toast.error('Impossible de supprimer : cette entité a des données associées');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Entité supprimée');
      await loadEntities();
    } catch (error: any) {
      console.error('Error deleting entity:', error);
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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const filteredEntities = selectedClient 
    ? entities.filter(e => e.client_id === selectedClient)
    : entities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestion des Entités Juridiques</h2>
          <p className="text-gray-600 mt-1">
            {filteredEntities.length} entité{filteredEntities.length > 1 ? 's' : ''} juridique{filteredEntities.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedClient || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                setSelectedClient('');
              } else {
                setSelectedClient(value);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
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
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entité
          </Button>
        </div>
      </div>

      {/* Entity List */}
      {filteredEntities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">Aucune entité juridique</h3>
            <p className="text-gray-600 text-center mb-4">
              {selectedClient 
                ? 'Aucune entité pour ce client'
                : 'Commencez par créer une entité juridique'}
            </p>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle entité
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntities.map((entity) => (
            <Card key={entity.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{entity.name}</CardTitle>
                      <CardDescription>{getClientName(entity.client_id)}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {entity.legal_form && (
                  <div className="text-sm">
                    <span className="text-gray-500">Forme juridique :</span>{' '}
                    <span className="text-gray-900">{entity.legal_form}</span>
                  </div>
                )}
                
                {entity.siren && (
                  <div className="text-sm">
                    <span className="text-gray-500">SIREN :</span>{' '}
                    <span className="text-gray-900 font-mono">{entity.siren}</span>
                  </div>
                )}

                {entity.siret && (
                  <div className="text-sm">
                    <span className="text-gray-500">SIRET :</span>{' '}
                    <span className="text-gray-900 font-mono">{entity.siret}</span>
                  </div>
                )}

                {entity.address && (
                  <div className="text-sm">
                    <span className="text-gray-500">Adresse :</span>{' '}
                    <span className="text-gray-900">{entity.address}</span>
                  </div>
                )}

                {entity.is_primary && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Entité principale
                  </div>
                )}
                
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(entity)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'entité ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Toutes les données associées à cette entité seront également supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(entity.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? 'Modifier l\'entité juridique' : 'Nouvelle entité juridique'}
            </DialogTitle>
            <DialogDescription>
              {editingEntity 
                ? 'Modifiez les informations de l\'entité juridique'
                : 'Créez une nouvelle entité juridique pour un client'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                disabled={!!editingEntity}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entité *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_form">Forme juridique</Label>
                <Input
                  id="legal_form"
                  value={formData.legal_form}
                  onChange={(e) => setFormData({ ...formData, legal_form: e.target.value })}
                  placeholder="SAS, SARL, SA..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siren">SIREN</Label>
                <Input
                  id="siren"
                  value={formData.siren}
                  onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                  placeholder="123 456 789"
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  placeholder="123 456 789 00012"
                  maxLength={14}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de la République, 75001 Paris"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email du contact</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@acme.fr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_primary" className="cursor-pointer">
                Entité principale du client
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingEntity ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
