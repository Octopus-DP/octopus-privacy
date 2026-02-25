import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle, Calendar, Mail, Plus, Edit, History, Search, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DemandeFormModal } from './DemandeFormModal';
import { HistoryModal } from './HistoryModal';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { filterBySearch } from '../utils/search';
import { FieldHelp } from './FieldHelp';
import { registreHelp } from '../utils/fieldHelp';

interface ExerciceDroitsProps {
  userData: any;
  accessToken: string;
  entityId?: string;
}

const statutColors = {
  'En cours': 'default',
  'Traitée': 'secondary',
  'En attente': 'outline',
};

const typeColors: Record<string, string> = {
  'Accès': 'bg-blue-100 text-blue-700',
  'Rectification': 'bg-green-100 text-green-700',
  'Effacement': 'bg-red-100 text-red-700',
  'Portabilité': 'bg-purple-100 text-purple-700',
  'Opposition': 'bg-orange-100 text-orange-700',
  'Limitation': 'bg-yellow-100 text-yellow-700',
};

export function ExerciceDroits({ userData, entityId }: ExerciceDroitsProps) {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDemande, setEditingDemande] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadDemandes(); }, [entityId]);

  const mapTypeToSQL = (type: string): string => {
    const mapping: Record<string, string> = {
      'Accès': 'access', 'Rectification': 'rectification', 'Effacement': 'erasure',
      'Portabilité': 'portability', 'Opposition': 'opposition', 'Limitation': 'restriction'
    };
    return mapping[type] || type.toLowerCase();
  };

  const mapStatutToSQL = (statut: string): string => {
    const mapping: Record<string, string> = {
      'En attente': 'pending', 'En cours': 'in_progress', 'Traitée': 'completed'
    };
    return mapping[statut] || 'pending';
  };

  const mapSQLToType = (type: string): string => {
    const mapping: Record<string, string> = {
      'access': 'Accès', 'rectification': 'Rectification', 'erasure': 'Effacement',
      'portability': 'Portabilité', 'opposition': 'Opposition', 'restriction': 'Limitation'
    };
    return mapping[type] || type;
  };

  const mapSQLToStatut = (status: string): string => {
    const mapping: Record<string, string> = {
      'pending': 'En attente', 'in_progress': 'En cours', 'completed': 'Traitée'
    };
    return mapping[status] || status;
  };

  const mapDemandeFormToSQL = (formData: any) => ({
    requester_name: formData.demandeur || formData.requester_name || formData.nomDemandeur || formData.name,
    email: formData.email || formData.emailDemandeur,
    phone: formData.phone || formData.telephone || null,
    request_type: mapTypeToSQL(formData.type || formData.request_type || formData.typeDemande || 'Accès'),
    description: formData.description || null,
    date_received: formData.dateDemande ? new Date(formData.dateDemande).toISOString() : (formData.date_received || new Date().toISOString()),
    deadline: formData.dateEcheance ? new Date(formData.dateEcheance).toISOString() : (formData.deadline || null),
    date_completed: formData.date_completed || formData.dateTraitement || null,
    status: mapStatutToSQL(formData.statut || formData.status || 'En attente'),
    assigned_to: formData.assigned_to || formData.assigneA || null,
    response: formData.response || formData.reponse || null,
    identity_verified: formData.identity_verified || formData.identiteVerifiee || false,
    verification_method: formData.verification_method || formData.methodeVerification || null,
    priority: formData.priority || formData.priorite || 'normal',
  });

  const loadDemandes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('demandes')
        .select('*, legal_entities(id, name)')
        .eq('client_id', userData.client_id)
        .order('created_at', { ascending: false });
      if (entityId) query = query.eq('entity_id', entityId);
      const { data, error } = await query;
      if (error) { toast.error('Erreur lors du chargement des demandes'); return; }
      setDemandes((data || []).map(d => ({
        ...d,
        type: mapSQLToType(d.request_type),
        statut: mapSQLToStatut(d.status),
        demandeur: d.requester_name,
        dateDemande: d.date_received,
        dateEcheance: d.deadline,
      })));
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const dataToSave = {
        id: editingDemande ? editingDemande.id : `demande_${Date.now()}`,
        ...mapDemandeFormToSQL(formData),
        entity_id: userData?.legal_entity_ids?.[0] || null,
        client_id: userData.client_id,
        client_code: userData.client_code,
        created_by: editingDemande ? undefined : userData?.email || 'system',
        updated_by: userData?.email || 'system',
      };

      if (editingDemande) {
        const { error } = await supabase.from('demandes').update(dataToSave).eq('id', editingDemande.id);
        if (error) throw error;
        toast.success('Demande modifiée avec succès');
      } else {
        const { error } = await supabase.from('demandes').insert([dataToSave]);
        if (error) throw error;
        toast.success('Demande créée avec succès');
      }
      await loadDemandes();
      setShowForm(false);
      setEditingDemande(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      throw error;
    }
  };

  const handleEdit = (demande: any) => { setEditingDemande(demande); setShowForm(true); };
  const handleViewHistory = (demande: any) => { setHistoryItem(demande); setShowHistory(true); };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const enCours = demandes.filter(d => d.statut === 'En cours').length;
  const enAttente = demandes.filter(d => d.statut === 'En attente').length;
  const traitees = demandes.filter(d => d.statut === 'Traitée').length;
  const filteredDemandes = filterBySearch(demandes, searchTerm);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-gray-900">Exercices de Droits</h1>
            <FieldHelp fieldKey="registreDroits" helpContent={registreHelp.droits} />
          </div>
          <p className="text-gray-600">Suivi des demandes d'exercice de droits des personnes concernées (Articles 15-22 RGPD)</p>
        </div>
        <Button onClick={() => { setEditingDemande(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />Ajouter
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-3"><CardDescription className="flex items-center gap-2"><Clock className="h-4 w-4" />En cours</CardDescription><CardTitle className="text-3xl text-blue-600">{enCours}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />En attente</CardDescription><CardTitle className="text-3xl text-orange-600">{enAttente}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Traitées</CardDescription><CardTitle className="text-3xl text-green-600">{traitees}</CardTitle></CardHeader></Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-blue-900 mb-1">Délai légal : 1 mois</div>
            <p className="text-sm text-blue-700">Vous disposez d'un mois pour répondre aux demandes d'exercice de droits, pouvant être prolongé de 2 mois selon la complexité.</p>
          </div>
        </div>
      </div>

      {demandes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les demandes (type, demandeur, email, statut...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Demandeur</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Échéance</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDemandes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">{searchTerm ? 'Aucune demande trouvée' : 'Aucune demande enregistrée'}</td></tr>
              ) : (
                filteredDemandes.map((demande) => {
                  const echeance = new Date(demande.dateEcheance);
                  const today = new Date();
                  const joursRestants = Math.ceil((echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = joursRestants < 0;
                  return (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs rounded-full ${typeColors[demande.type]}`}>{demande.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-gray-900">{demande.demandeur}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" />{demande.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(demande.dateDemande).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                          <Clock className="h-4 w-4" />
                          <div>
                            {new Date(demande.dateEcheance).toLocaleDateString('fr-FR')}
                            <div className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>{isOverdue ? `Retard: ${Math.abs(joursRestants)}j` : `${joursRestants}j restants`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statutColors[demande.statut as keyof typeof statutColors] as any}>{demande.statut}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewHistory(demande)}><History className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(demande)}><Edit className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <DemandeFormModal
          demande={editingDemande}
          onClose={() => { setShowForm(false); setEditingDemande(null); }}
          onSave={handleSave}
        />
      )}

      {showHistory && historyItem && (
        <HistoryModal
          item={historyItem}
          module="demande"
          onClose={() => { setShowHistory(false); setHistoryItem(null); }}
        />
      )}
    </div>
  );
}