import { useState, useEffect } from 'react';
import { Download, Database, Plus, Edit, History, Search, X, Shield, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TraitementFormModal } from './TraitementFormModal';
import { HistoryModal } from './HistoryModal';
import { filterBySearch } from '../utils/search';
import { FieldHelp } from './FieldHelp';
import { registreHelp } from '../utils/fieldHelp';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface RegistreTraitementsProps {
  userData: any;
  accessToken?: string;
  entityId?: string;
}

export function RegistreTraitements({ userData, entityId }: RegistreTraitementsProps) {
  const [traitements, setTraitements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTraitement, setEditingTraitement] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTraitements();
  }, [entityId]);

  const loadTraitements = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('traitements')
        .select(`
          *,
          legal_entities (
            id,
            name,
            siren
          )
        `)
        .eq('client_id', userData.client_id)
        .order('created_at', { ascending: false });

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading traitements:', error);
        toast.error('Erreur lors du chargement des traitements');
        return;
      }

      setTraitements(data || []);
    } catch (error) {
      console.error('Error loading traitements:', error);
      toast.error('Erreur lors du chargement des traitements');
    } finally {
      setLoading(false);
    }
  };

  const mapFormDataToSQL = (formData: any) => {
    const toArray = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          return value.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      return [String(value)];
    };

    return {
      name: formData.name || formData.nom,
      description: formData.description || null,
      purpose: formData.purpose || formData.finalite || null,
      legal_basis: formData.baseJuridique || formData.legal_basis || null,
      data_categories: toArray(formData.categoriesDonnees || formData.data_categories),
      data_subjects: toArray(formData.personnesConcernees || formData.data_subjects),
      sensitive_data: formData.donneesSensibles || formData.sensitive_data || false,
      responsible_person: formData.responsableTraitement || formData.responsible_person || null,
      responsible_email: formData.emailResponsable || formData.responsible_email || null,
      retention_period: formData.dureeConservation || formData.retention_period || null,
      security_measures: formData.mesuresSecurite || formData.security_measures || null,
      has_transfers: formData.transfertsHorsUE || formData.has_transfers || false,
      transfer_countries: toArray(formData.paysDestination || formData.transfer_countries),
      transfer_guarantees: formData.garantiesTransfert || formData.transfer_guarantees || null,
      risk_level: formData.niveauRisque || formData.risk_level || null,
      pia_required: formData.piaRequise || formData.pia_required || false,
      pia_completed: formData.piaRealisee || formData.pia_completed || false,
      status: formData.status || 'active',
    };
  };

  const handleSave = async (formData: any) => {
    try {
      const newId = editingTraitement ? editingTraitement.id : `traitement_${Date.now()}`;

      const dataToSave = {
        id: newId,
        ...mapFormDataToSQL(formData),
        entity_id: userData?.legal_entity_ids?.[0] || null,
        client_id: userData.client_id,
        client_code: userData.client_code,
        created_by: editingTraitement ? undefined : userData.email,
        updated_by: userData.email,
      };

      if (editingTraitement) {
        const { error } = await supabase
          .from('traitements')
          .update(dataToSave)
          .eq('id', editingTraitement.id);
        if (error) throw error;
        toast.success('Traitement modifié avec succès');
      } else {
        const { error } = await supabase
          .from('traitements')
          .insert([dataToSave]);
        if (error) throw error;
        toast.success('Traitement créé avec succès');
      }

      await loadTraitements();
      setShowForm(false);
      setEditingTraitement(null);
    } catch (error: any) {
      console.error('Error saving traitement:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      throw error;
    }
  };

  const handleEdit = (traitement: any) => {
    setEditingTraitement(traitement);
    setShowForm(true);
  };

  const handleViewHistory = (traitement: any) => {
    setHistoryItem(traitement);
    setShowHistory(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTraitements = filterBySearch(traitements, searchTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-gray-900">Registre des Traitements</h1>
            <FieldHelp fieldKey="registreTraitements" helpContent={registreHelp.traitements} />
          </div>
          <p className="text-gray-600">
            Documentation complète de vos traitements de données personnelles (Article 30 RGPD)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingTraitement(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter (PDF)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total des traitements</CardDescription>
            <CardTitle className="text-3xl">{traitements.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Actifs</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {traitements.filter(t => t.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>PIA requise</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {traitements.filter(t => t.pia_required && !t.pia_completed).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search Bar */}
      {traitements.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les traitements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {searchTerm && traitements.length > 0 && (
        <div className="text-sm text-gray-600">
          {filteredTraitements.length} résultat{filteredTraitements.length !== 1 ? 's' : ''} sur {traitements.length}
        </div>
      )}

      {/* Traitements List */}
      <div className="space-y-4">
        {traitements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucun traitement enregistré</p>
              <Button onClick={() => { setEditingTraitement(null); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier traitement
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTraitements.map((traitement) => (
            <Card key={traitement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="bg-blue-100 rounded-lg p-2 mt-1">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{traitement.name}</CardTitle>
                        <CardDescription>{traitement.purpose}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={traitement.status === 'active' ? 'default' : 'secondary'}>
                      {traitement.status === 'active' ? 'Actif' : traitement.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleViewHistory(traitement)}>
                      <History className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(traitement)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Personnes concernées</div>
                    <div className="text-gray-900">
                      {Array.isArray(traitement.data_subjects)
                        ? traitement.data_subjects.join(', ')
                        : traitement.data_subjects || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Base juridique</div>
                    <div className="text-gray-900">{traitement.legal_basis || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Durée de conservation</div>
                    <div className="text-gray-900">{traitement.retention_period || '—'}</div>
                  </div>
                  {traitement.data_categories && traitement.data_categories.length > 0 && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <div className="text-gray-500 mb-2">Catégories de données</div>
                      <div className="flex flex-wrap gap-2">
                        {traitement.data_categories.map((cat: string, idx: number) => (
                          <Badge key={idx} variant="outline">{cat}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {traitement.security_measures && traitement.security_measures.length > 0 && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <div className="text-gray-500 mb-2">Mesures de sécurité</div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(traitement.security_measures)
                          ? traitement.security_measures
                          : [traitement.security_measures]
                        ).map((mesure: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-green-50 text-green-700">
                            <Shield className="h-3 w-3 mr-1" />
                            {mesure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {traitement.updated_at && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Dernière MAJ : {new Date(traitement.updated_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TraitementFormModal
          traitement={editingTraitement}
          onClose={() => { setShowForm(false); setEditingTraitement(null); }}
          onSave={handleSave}
        />
      )}

      {showHistory && historyItem && (
        <HistoryModal
          module="traitement"
          item={historyItem}
          onClose={() => { setShowHistory(false); setHistoryItem(null); }}
        />
      )}
    </div>
  );
}