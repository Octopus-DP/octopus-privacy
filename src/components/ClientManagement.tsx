import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, Mail, Phone, MapPin, Upload, X, Users, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface Client {
  id: string;
  name: string;
  codeClient?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  userCount?: number;
  entityCount?: number;
}

interface ClientManagementProps {
  clients: Client[];
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ClientManagement({ clients, onCreate, onUpdate, onDelete }: ClientManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    codeClient: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      codeClient: '',
      logo: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
    });
    setLogoPreview('');
    setEditingClient(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 2MB)');
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        alert('Le fichier doit être une image');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, logo: base64 });
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    try {
      await onCreate(formData);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Erreur lors de la création du client');
    }
  };

  const handleUpdate = async () => {
    if (!editingClient) return;
    try {
      await onUpdate(editingClient.id, formData);
      setEditingClient(null);
      resetForm();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Erreur lors de la modification du client');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      codeClient: client.codeClient || '',
      logo: client.logo || '',
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone || '',
      address: client.address || '',
    });
    setLogoPreview(client.logo || '');
  };

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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>
                Créez un nouveau client pour votre entreprise.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Entreprise SAS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeClient">Code client</Label>
                <Input
                  id="codeClient"
                  value={formData.codeClient}
                  onChange={(e) => setFormData({ ...formData, codeClient: e.target.value })}
                  placeholder="Ex: E12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => document.getElementById('logo')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  {logoPreview && (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="h-10 w-10 rounded-full"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => {
                          setFormData({ ...formData, logo: '' });
                          setLogoPreview('');
                        }}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de contact *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@entreprise.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse complète de l'entreprise"
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
                      <CardDescription>
                        Créé le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Entity and User counts */}
                <div className="flex gap-3 pb-3 border-b">
                  <div className="flex items-center gap-2 text-sm bg-indigo-50 px-3 py-1.5 rounded-lg">
                    <Building className="h-4 w-4 text-indigo-600" />
                    <span className="text-gray-700">
                      <span className="font-semibold text-indigo-900">{client.entityCount || 0}</span> entité{(client.entityCount || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      <span className="font-semibold text-blue-900">{client.userCount || 0}</span> utilisateur{(client.userCount || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{client.contactEmail}</span>
                </div>
                {client.contactPhone && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{client.contactPhone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{client.address}</span>
                  </div>
                )}
                
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
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Modifier le client</DialogTitle>
                        <DialogDescription>
                          Modifiez les informations du client.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Nom de l'entreprise *</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-codeClient">Code client</Label>
                          <Input
                            id="edit-codeClient"
                            value={formData.codeClient}
                            onChange={(e) => setFormData({ ...formData, codeClient: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-logo">Logo</Label>
                          <div className="flex items-center">
                            <Input
                              id="edit-logo"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => document.getElementById('edit-logo')?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                            {logoPreview && (
                              <div className="relative">
                                <img
                                  src={logoPreview}
                                  alt="Logo"
                                  className="h-10 w-10 rounded-full"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="absolute top-0 right-0"
                                  onClick={() => {
                                    setFormData({ ...formData, logo: '' });
                                    setLogoPreview('');
                                  }}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email de contact *</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Téléphone</Label>
                          <Input
                            id="edit-phone"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          />
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
                          Cette action est irréversible. Tous les utilisateurs associés à ce client seront également supprimés.
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