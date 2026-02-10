import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Mail, Phone, MapPin, Upload, X, Users, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Client {
  id: string;
  code: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  siren?: string;
  siret?: string;
  status: string;
  created_at: string;
  userCount?: number;
  entityCount?: number;
}

interface ClientManagementProps {
  userData: any;
  accessToken: string;
}

export function ClientManagement({ userData, accessToken }: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    siren: '',
    siret: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Charger le nombre d'utilisateurs et d'entités pour chaque client
      const clientsWithCounts = await Promise.all(
        (data || []).map(async (client) => {
          // Compter les utilisateurs
          const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);

          // Compter les entités juridiques
          const { count: entityCount } = await supabase
            .from('legal_entities')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);

          return {
            ...client,
            userCount: userCount || 0,
            entityCount: entityCount || 0,
          };
        })
      );

      setClients(clientsWithCounts);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      siren: '',
      siret: '',
    });
    setEditingClient(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.code) {
        toast.error('Le nom et le code client sont requis');
        return;
      }

      // Générer un ID unique
      const clientId = `client_${Date.now()}`;

      const clientData = {
        id: clientId,
        code: formData.code.toUpperCase(),
        name: formData.name,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        address: formData.address || null,
        siren: formData.siren || null,
        siret: formData.siret || null,
        status: 'active',
        created_by: (userData && userData.email) ? userData.email : 'system',
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('Ce code client existe déjà');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Client créé avec succès');
      setIsCreateOpen(false);
      resetForm();
      await loadClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Erreur lors de la création du client');
    }
  };

  const handleUpdate = async () => {
    if (!editingClient) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          address: formData.address || null,
          siren: formData.siren || null,
          siret: formData.siret || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingClient.id);

      if (error) throw error;

      toast.success('Client modifié avec succès');
      setEditingClient(null);
      resetForm();
      await loadClients();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.error(error.message || 'Erreur lors de la modification du client');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          toast.error('Impossible de supprimer : ce client a des utilisateurs ou des entités associés');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Client supprimé');
      await loadClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error(error.message || 'Erreur lors de la suppression du client');
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      code: client.code,
      contact_name: client.contact_name || '',
      contact_email: client.contact_email || '',
      contact_phone: client.contact_phone || '',
      address: client.address || '',
      siren: client.siren || '',
      siret: client.siret || '',
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
          <h2 className="text-gray-900">Gestion des Clients</h2>
          <p className="text-gray-600 mt-1">
            {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>
                Créez un nouveau client pour l'application RGPD
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'entreprise *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code client *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="ACME001"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nom du contact</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Téléphone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Rue de la République, 75001 Paris"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate}>
                Créer le client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 mb-2">Aucun client</h3>
            <p className="text-gray-600 text-center mb-4">
              Commencez par créer votre premier client
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>Code: {client.code}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.contact_email && (
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{client.contact_email}</span>
                  </div>
                )}

                {client.contact_phone && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{client.contact_phone}</span>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{client.address}</span>
                  </div>
                )}

                <div className="flex gap-4 pt-3 border-t text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{client.userCount || 0} utilisateur{(client.userCount || 0) > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{client.entityCount || 0} entité{(client.entityCount || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(client)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Modifier le client</DialogTitle>
                        <DialogDescription>
                          Modifiez les informations du client
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nom de l'entreprise *</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-code">Code client (non modifiable)</Label>
                            <Input
                              id="edit-code"
                              value={formData.code}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-contact-name">Nom du contact</Label>
                            <Input
                              id="edit-contact-name"
                              value={formData.contact_name}
                              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-contact-email">Email du contact</Label>
                            <Input
                              id="edit-contact-email"
                              type="email"
                              value={formData.contact_email}
                              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-contact-phone">Téléphone</Label>
                            <Input
                              id="edit-contact-phone"
                              value={formData.contact_phone}
                              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-siren">SIREN</Label>
                            <Input
                              id="edit-siren"
                              value={formData.siren}
                              onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                              maxLength={9}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-address">Adresse</Label>
                          <Textarea
                            id="edit-address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingClient(null)}>
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
                        <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Tous les utilisateurs et entités associés seront également supprimés.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(client.id)}
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
