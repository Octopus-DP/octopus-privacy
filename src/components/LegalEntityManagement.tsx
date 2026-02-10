import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LegalEntity {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  siren: string;
  logo?: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
}

interface LegalEntityManagementProps {
  accessToken: string;
  clients: Array<{ id: string; name: string }>;
  onEntitiesChange?: () => void;
}

export function LegalEntityManagement({ accessToken, clients, onEntitiesChange }: LegalEntityManagementProps) {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    siren: '',
    logo: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const response = await fetch(`${apiUrl}/legal-entities`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEntities(data.entities || []);
      }
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 2MB)');
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation SIREN (9 chiffres)
    if (formData.siren && !/^\d{9}$/.test(formData.siren)) {
      setError('Le SIREN doit contenir exactement 9 chiffres');
      return;
    }

    try {
      const url = editingEntity
        ? `${apiUrl}/legal-entities/${editingEntity.id}`
        : `${apiUrl}/legal-entities`;

      const response = await fetch(url, {
        method: editingEntity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await loadEntities();
        onEntitiesChange?.();
        setShowDialog(false);
        setEditingEntity(null);
        setFormData({ clientId: '', name: '', siren: '', logo: '', address: '', contactName: '', contactEmail: '', contactPhone: '' });
      } else {
        alert('Erreur lors de la sauvegarde de l\'entité : ' + data.error);
      }
    } catch (error) {
      console.error('Error saving entity:', error);
      setError('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entité juridique ?')) return;

    try {
      const response = await fetch(`${apiUrl}/legal-entities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Entité supprimée');
        loadEntities();
        if (onEntitiesChange) {
          onEntitiesChange();
        }
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting entity:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const handleEdit = (entity: LegalEntity) => {
    setEditingEntity(entity);
    setFormData({
      clientId: entity.clientId,
      name: entity.name,
      siren: entity.siren,
      logo: entity.logo || '',
      address: entity.address || '',
      contactName: entity.contactName || '',
      contactEmail: entity.contactEmail || '',
      contactPhone: entity.contactPhone || '',
    });
    setLogoPreview(entity.logo || '');
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      name: '',
      siren: '',
      logo: '',
      address: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    });
    setLogoPreview('');
    setEditingEntity(null);
    setError('');
  };

  const filteredEntities = selectedClient
    ? entities.filter(e => e.clientId === selectedClient)
    : entities;

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Entités Juridiques</h2>
          <p className="text-gray-600">Gérez les entités juridiques de vos clients</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entité juridique
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter-client">Filtrer par client</Label>
          <select
            id="filter-client"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Tous les clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map((entity) => (
          <Card key={entity.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {entity.logo ? (
                    <img src={entity.logo} alt={entity.name} className="w-12 h-12 object-contain rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{entity.name}</CardTitle>
                    <CardDescription className="text-sm">{entity.clientName}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(entity)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entity.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">SIREN:</span> {entity.siren}
                </div>
                {entity.address && (
                  <div>
                    <span className="font-medium">Adresse:</span> {entity.address}
                  </div>
                )}
                {entity.contactName && (
                  <div>
                    <span className="font-medium">Contact:</span> {entity.contactName}
                  </div>
                )}
                {entity.contactEmail && (
                  <div className="text-xs text-blue-600">{entity.contactEmail}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune entité juridique</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            Créer la première entité
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? 'Modifier l\'entité juridique' : 'Nouvelle entité juridique'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de l'entité juridique
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <select
                id="clientId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Sélectionnez un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="relative">
                    <img src={logoPreview} alt="Preview" className="w-20 h-20 object-contain border rounded" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
                      onClick={() => {
                        setFormData({ ...formData, logo: '' });
                        setLogoPreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: PNG, JPG (max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Raison Sociale */}
            <div className="space-y-2">
              <Label htmlFor="name">Raison Sociale *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: ACME FRANCE SAS"
              />
            </div>

            {/* SIREN */}
            <div className="space-y-2">
              <Label htmlFor="siren">SIREN *</Label>
              <Input
                id="siren"
                required
                pattern="\d{9}"
                value={formData.siren}
                onChange={(e) => setFormData({ ...formData, siren: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                placeholder="123456789"
                maxLength={9}
              />
              <p className="text-xs text-gray-500">9 chiffres</p>
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="12 rue de la Paix, 75000 Paris"
              />
            </div>

            {/* Contact */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Informations de contact</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="contactName">Nom du contact</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email du contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@acme.fr"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Téléphone du contact</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                {editingEntity ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}