import { useState, useEffect } from 'react';
import { X, Clock, User, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';

interface HistoryModalProps {
  module: 'traitement' | 'demande' | 'violation';
  item: any;
  onClose: () => void;
}

export function HistoryModal({ module, item, onClose }: HistoryModalProps) {
  const itemId = item?.id || '';
  const itemName = item?.nom || item?.requester_name || item?.demandeur || item?.titre || item?.id || '';
  const clientId = item?.client_id || '';
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const modulePath = {
    traitement: 'traitements',
    demande: 'demandes',
    violation: 'violations'
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('history_logs')
        .select('*')
        .eq('client_id', clientId)
        .eq('record_id', itemId)
        .eq('table_name', modulePath[module])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Non défini';
    if (Array.isArray(value)) return value.join(', ') || 'Aucun';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    return String(value);
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      nom: 'Nom', titre: 'Titre', finalite: 'Finalité',
      personnesConcernees: 'Personnes concernées', baseJuridique: 'Base juridique',
      dureeConservation: 'Durée de conservation', categoriesDonnees: 'Catégories de données',
      mesuresSecurite: 'Mesures de sécurité', statut: 'Statut', type: 'Type',
      demandeur: 'Demandeur', email: 'Email', dateDemande: 'Date de demande',
      dateEcheance: 'Date d\'échéance', description: 'Description',
      dateDetection: 'Date de détection', dateNotificationCNIL: 'Date notification CNIL',
      gravite: 'Gravité', personnesImpactees: 'Personnes impactées',
      typeDonnees: 'Types de données', mesuresPrises: 'Mesures prises',
      notificationCNIL: 'Notification CNIL', notificationPersonnes: 'Notification personnes',
    };
    return labels[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-gray-900">Historique des modifications</h2>
            <p className="text-sm text-gray-600 mt-1">{itemName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun historique disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((entry, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${entry.action === 'created' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Clock className={`h-5 w-5 ${entry.action === 'created' ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <Badge variant={entry.action === 'created' ? 'default' : 'secondary'}>
                          {entry.action === 'created' ? 'Création' : 'Modification'}
                        </Badge>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{entry.user_email || entry.created_by || 'Système'}</span>
                          <span>•</span>
                          <span>{new Date(entry.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {entry.action === 'updated' && entry.changes && Object.keys(entry.changes).length > 0 && (
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">Champs modifiés :</p>
                      {Object.entries(entry.changes).map(([field, change]: [string, any]) => (
                        <div key={field} className="bg-white rounded p-3 border">
                          <div className="text-sm text-gray-900 mb-2">{getFieldLabel(field)}</div>
                          <div className="flex items-start gap-3 text-sm">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Ancienne valeur</div>
                              <div className="text-gray-700 bg-red-50 px-2 py-1 rounded">{formatValue(change.from)}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 mt-5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Nouvelle valeur</div>
                              <div className="text-gray-700 bg-green-50 px-2 py-1 rounded">{formatValue(change.to)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.action === 'created' && (
                    <div className="text-sm text-gray-600 bg-green-50 rounded-lg p-3">
                      Élément créé avec succès
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}