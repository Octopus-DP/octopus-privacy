import { useState, useEffect } from 'react';
import { Plus, Eye, Play, Pause, Trash2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { PhishingCampaignWizard } from './PhishingCampaignWizard';
import { PhishingCampaignDetail } from './PhishingCampaignDetail';
import { PhishingEmailHelp } from './PhishingEmailHelp';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PhishingCampaignListProps {
  userData: any;
  entityId: string;
}

export function PhishingCampaignList({ userData, entityId }: PhishingCampaignListProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('phishing_campaigns')
        .select('*')
        .eq('client_id', userData.client_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Erreur lors du chargement des campagnes');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir lancer cette campagne ?')) return;
    try {
      const { error } = await supabase
        .from('phishing_campaigns')
        .update({ status: 'running', launched_at: new Date().toISOString(), launched_by: userData.email })
        .eq('id', campaignId);
      if (error) throw error;
      toast.success('Campagne lancée avec succès !');
      loadCampaigns();
    } catch (error: any) {
      toast.error('Erreur lors du lancement : ' + error.message);
    }
  };

  const handleStopCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir arrêter cette campagne ?')) return;
    try {
      const { error } = await supabase
        .from('phishing_campaigns')
        .update({ status: 'stopped', stopped_at: new Date().toISOString(), stopped_by: userData.email })
        .eq('id', campaignId);
      if (error) throw error;
      toast.success('Campagne arrêtée');
      loadCampaigns();
    } catch (error: any) {
      toast.error('Erreur lors de l\'arrêt : ' + error.message);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.')) return;
    try {
      // Supprimer d'abord les destinataires
      await supabase.from('phishing_recipients').delete().eq('campaign_id', campaignId);
      const { error } = await supabase.from('phishing_campaigns').delete().eq('id', campaignId);
      if (error) throw error;
      toast.success('Campagne supprimée');
      loadCampaigns();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression : ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
      scheduled: { label: 'Programmée', className: 'bg-blue-100 text-blue-700' },
      running: { label: 'En cours', className: 'bg-green-100 text-green-700' },
      stopped: { label: 'Arrêtée', className: 'bg-orange-100 text-orange-700' },
      completed: { label: 'Terminée', className: 'bg-purple-100 text-purple-700' },
      archived: { label: 'Archivée', className: 'bg-gray-100 text-gray-500' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>{config.label}</span>;
  };

  const filteredCampaigns = filterStatus === 'all' ? campaigns : campaigns.filter(c => c.status === filterStatus);

  if (showWizard) {
    return (
      <PhishingCampaignWizard
        userData={userData}
        entityId={entityId}
        onClose={() => { setShowWizard(false); loadCampaigns(); }}
      />
    );
  }

  if (selectedCampaign) {
    return (
      <PhishingCampaignDetail
        campaignId={selectedCampaign.id}
        userData={userData}
        onClose={() => { setSelectedCampaign(null); loadCampaigns(); }}
      />
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">Aucune campagne</h3>
        <p className="text-gray-600 mb-6">Créez votre première campagne de test de phishing</p>
        <Button onClick={() => setShowWizard(true)}><Plus className="mr-2 h-4 w-4" />Créer ma première campagne</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Programmée</option>
            <option value="running">En cours</option>
            <option value="completed">Terminée</option>
            <option value="archived">Archivée</option>
          </select>
          <PhishingEmailHelp />
        </div>
        <Button onClick={() => setShowWizard(true)}><Plus className="mr-2 h-4 w-4" />Nouvelle campagne</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Nom de la campagne</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Début</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Destinataires</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-gray-900">{campaign.name}</div>
                  {campaign.description && <div className="text-sm text-gray-500">{campaign.description}</div>}
                </td>
                <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{campaign.recipient_count || 0}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}><Eye className="h-4 w-4" /></Button>
                    {campaign.status === 'draft' && <Button variant="ghost" size="sm" onClick={() => handleLaunchCampaign(campaign.id)}><Play className="h-4 w-4" /></Button>}
                    {campaign.status === 'running' && <Button variant="ghost" size="sm" onClick={() => handleStopCampaign(campaign.id)}><Pause className="h-4 w-4" /></Button>}
                    {(campaign.status === 'draft' || campaign.status === 'completed' || campaign.status === 'stopped') && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Aucune campagne ne correspond à ce filtre</p>
        </div>
      )}
    </div>
  );
}