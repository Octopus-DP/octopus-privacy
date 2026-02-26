import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Calendar, Shield, Plus, Edit, History, Search, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ViolationFormModal } from './ViolationFormModal';
import { HistoryModal } from './HistoryModal';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { filterBySearch } from '../utils/search';
import { FieldHelp } from './FieldHelp';
import { registreHelp } from '../utils/fieldHelp';

interface ViolationsDonneesProps {
  userData: any;
  accessToken?: string;
  entityId?: string;
}

const graviteCouleurs = {
  'Critique': 'bg-red-100 text-red-700 border-red-300',
  'Élevée': 'bg-orange-100 text-orange-700 border-orange-300',
  'Moyenne': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Faible': 'bg-green-100 text-green-700 border-green-300',
};

const statutCouleurs: Record<string, 'default' | 'secondary' | 'destructive'> = {
  'Résolue': 'secondary',
  'En cours': 'default',
  'Nouvelle': 'destructive',
};

export function ViolationsDonnees({ userData, entityId }: ViolationsDonneesProps) {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingViolation, setEditingViolation] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadViolations();
  }, [entityId]);

  const mapGraviteToSQL = (gravite: string): string => {
    const mapping: Record<string, string> = {
      'Critique': 'critical', 'Élevée': 'high', 'Moyenne': 'medium', 'Faible': 'low'
    };
    return mapping[gravite] || 'medium';
  };

  const mapStatutToSQL = (statut: string): string => {
    const mapping: Record<string, string> = {
      'Nouvelle': 'open', 'En cours': 'investigating', 'Résolue': 'resolved'
    };
    return mapping[statut] || 'open';
  };

  const mapSQLToGravite = (severity: string): string => {
    const mapping: Record<string, string> = {
      'critical': 'Critique', 'high': 'Élevée', 'medium': 'Moyenne', 'low': 'Faible'
    };
    return mapping[severity] || severity;
  };

  const mapSQLToStatut = (status: string): string => {
    const mapping: Record<string, string> = {
      'open': 'Nouvelle', 'investigating': 'En cours',
      'mitigated': 'En cours', 'resolved': 'Résolue', 'closed': 'Résolue'
    };
    return mapping[status] || status;
  };

  const mapViolationFormToSQL = (formData: any) => {
    return {
      title: formData.titre || formData.title,
      description: formData.description || null,
      date_detected: formData.dateDetection ? new Date(formData.dateDetection).toISOString() : new Date().toISOString(),
      date_occurred: formData.dateIncident ? new Date(formData.dateIncident).toISOString() : null,
      violation_type: formData.typeViolation || formData.violation_type || null,
      severity: mapGraviteToSQL(formData.gravite || formData.severity || 'Moyenne'),
      data_categories: formData.categoriesDonnees || formData.data_categories || [],
      number_affected: formData.nombrePersonnes || formData.number_affected || null,
      sensitive_data_involved: formData.donneesSensibles || formData.sensitive_data_involved || false,
      impact_description: formData.impactDescription || formData.impact_description || null,
      consequences: formData.consequences || null,
      immediate_measures: formData.mesuresImmédiates || formData.immediate_measures || null,
      corrective_measures: formData.mesuresCorrectives || formData.corrective_measures || null,
      preventive_measures: formData.mesuresPreventives || formData.preventive_measures || null,
      cnil_notified: formData.cnilNotifiee || formData.cnil_notified || false,
      cnil_notification_date: formData.dateCNIL ? new Date(formData.dateCNIL).toISOString() : null,
      cnil_reference: formData.referenceCNIL || formData.cnil_reference || null,
      individuals_notified: formData.personnesNotifiees || formData.individuals_notified || false,
      individuals_notification_date: formData.dateNotificationPersonnes ? new Date(formData.dateNotificationPersonnes).toISOString() : null,
      status: mapStatutToSQL(formData.statut || formData.status || 'Nouvelle'),
    };
  };

  const loadViolations = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('violations')
        .select(`*, legal_entities (id, name)`)
        .eq('client_id', userData.client_id)
        .order('created_at', { ascending: false });

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading violations:', error);
        toast.error('Erreur lors du chargement des violations');
        return;
      }

      const mappedData = (data || []).map(v => ({
        ...v,
        titre: v.title,
        gravite: mapSQLToGravite(v.severity),
        statut: mapSQLToStatut(v.status),
        dateDetection: v.date_detected,
      }));

      setViolations(mappedData);
    } catch (error) {
      console.error('Error loading violations:', error);
      toast.error('Erreur lors du chargement des violations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const newId = editingViolation ? editingViolation.id : `violation_${Date.now()}`;

      const dataToSave = {
        id: newId,
        ...mapViolationFormToSQL(formData),
        client_id: userData.client_id,
        client_code: userData.client_code,
        entity_id: userData?.legal_entity_ids?.[0] || null,
        created_by: editingViolation ? undefined : userData?.email || 'system',
        updated_by: userData?.email || 'system',
      };

      if (editingViolation) {
        const { error } = await supabase.from('violations').update(dataToSave).eq('id', editingViolation.id);
        if (error) throw error;
        toast.success('Violation modifiée avec succès');
      } else {
        const { error } = await supabase.from('violations').insert([dataToSave]);
        if (error) throw error;
        toast.success('Violation créée avec succès');
      }

      await loadViolations();
      setShowForm(false);
      setEditingViolation(null);
    } catch (error: any) {
      console.error('Error saving violation:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      throw error;
    }
  };

  const handleEdit = (violation: any) => {
    setEditingViolation(violation);
    setShowForm(true);
  };

  const handleViewHistory = (violation: any) => {
    setHistoryItem(violation);
    setShowHistory(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const nouvelles = violations.filter(v => v.statut === 'Nouvelle').length;
  const enCours = violations.filter(v => v.statut === 'En cours').length;
  const resolues = violations.filter(v => v.statut === 'Résolue').length;
  const filteredViolations = filterBySearch(violations, searchTerm);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-gray-900">Registre des Violations</h1>
            <FieldHelp fieldKey="registreViolations" helpContent={registreHelp.violations} />
          </div>
          <p className="text-gray-600">Suivi des violations de données personnelles (Article 33 RGPD)</p>
        </div>
        <Button onClick={() => { setEditingViolation(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Déclarer une violation
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Nouvelles
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{nouvelles}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> En cours
            </CardDescription>
            <CardTitle className="text-3xl text-orange-600">{enCours}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Résolues
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{resolues}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-semibold">Délai légal : 72 heures</span>
          <p className="text-sm mt-1">
            Vous devez notifier la CNIL dans les 72 heures suivant la prise de connaissance d'une violation
            (sauf si la violation ne présente pas de risque pour les droits et libertés des personnes).
          </p>
        </AlertDescription>
      </Alert>

      {violations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les violations (titre, gravité, statut...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? 'Aucune violation trouvée' : 'Aucune violation enregistrée'}
                </p>
                {!searchTerm && (
                  <p className="text-sm">Bonne nouvelle ! Aucune violation de données n'a été déclarée.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredViolations.map((violation) => {
            const dateDetection = new Date(violation.dateDetection);
            const heuresEcoulees = Math.floor((Date.now() - dateDetection.getTime()) / (1000 * 60 * 60));
            const delaiDepasse = heuresEcoulees > 72;

            return (
              <Card key={violation.id} className={`border-l-4 ${graviteCouleurs[violation.gravite as keyof typeof graviteCouleurs]?.split(' ')[0]}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{violation.titre}</h3>
                        <span className={`inline-flex px-2.5 py-1 text-xs rounded-full border ${graviteCouleurs[violation.gravite as keyof typeof graviteCouleurs]}`}>
                          {violation.gravite}
                        </span>
                        <Badge variant={statutCouleurs[violation.statut]}>
                          {violation.statut}
                        </Badge>
                      </div>

                      {violation.description && (
                        <p className="text-gray-600 mb-3">{violation.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>Détectée le {dateDetection.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span className={delaiDepasse && violation.statut !== 'Résolue' ? 'text-red-600 font-medium' : ''}>
                            {heuresEcoulees}h écoulées {delaiDepasse && violation.statut !== 'Résolue' && '(⚠️ Délai dépassé)'}
                          </span>
                        </div>
                        {violation.cnil_notified && (
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <Shield className="h-4 w-4" />
                            <span>CNIL notifiée</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewHistory(violation)}>
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(violation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {showForm && (
        <ViolationFormModal
          violation={editingViolation}
          onClose={() => { setShowForm(false); setEditingViolation(null); }}
          onSave={handleSave}
        />
      )}

      {showHistory && historyItem && (
        <HistoryModal
          module="violation"
          item={historyItem}
          onClose={() => { setShowHistory(false); setHistoryItem(null); }}
        />
      )}
    </div>
  );
}