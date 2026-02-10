import { useState, useEffect } from 'react';
import { Plus, Eye, Play, Pause, Copy, Trash2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { PhishingCampaignWizard } from './PhishingCampaignWizard';
import { PhishingCampaignDetail } from './PhishingCampaignDetail';
import { PhishingEmailHelp } from './PhishingEmailHelp';
import { projectId } from '../utils/supabase/info';

interface PhishingCampaignListProps {
  userData: any;
  accessToken: string;
  entityId: string;
}

export function PhishingCampaignList({ userData, accessToken, entityId }: PhishingCampaignListProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/phishing/campaigns`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir lancer cette campagne ? Les emails seront envoyés immédiatement aux destinataires.')) return;

    try {
      console.log('[CAMPAIGN] Launching campaign:', campaignId);
      
      const response = await fetch(`${apiUrl}/phishing/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log('[CAMPAIGN] Launch response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to launch campaign');
      }

      alert(data.message || 'Campagne lancée avec succès ! Consultez la console (F12) pour voir les logs d\'envoi.');
      loadCampaigns();
    } catch (error: any) {
      console.error('[CAMPAIGN] Error launching campaign:', error);
      alert(`Erreur lors du lancement de la campagne: ${error.message}\n\nConsultez la console (F12) pour plus de détails.`);
    }
  };

  const handleStopCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir arrêter cette campagne ?')) return;

    try {
      const response = await fetch(`${apiUrl}/phishing/campaigns/${campaignId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to stop campaign');
      }

      loadCampaigns();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      alert('Erreur lors de l\'arrêt de la campagne');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.')) return;

    try {
      const response = await fetch(`${apiUrl}/phishing/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Erreur lors de la suppression de la campagne');
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
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getMaturityBadge = (score: string) => {
    const config: Record<string, { className: string; icon: any }> = {
      'A': { className: 'bg-green-100 text-green-700', icon: TrendingUp },
      'B': { className: 'bg-blue-100 text-blue-700', icon: TrendingUp },
      'C': { className: 'bg-orange-100 text-orange-700', icon: Minus },
      'D': { className: 'bg-red-100 text-red-700', icon: TrendingDown },
    };

    const { className, icon: Icon } = config[score] || config['D'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${className}`}>
        <Icon className="h-3 w-3" />
        Score {score}
      </span>
    );
  };

  const filteredCampaigns = filterStatus === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.status === filterStatus);

  if (showWizard) {
    return (
      <PhishingCampaignWizard
        userData={userData}
        accessToken={accessToken}
        entityId={entityId}
        onClose={() => {
          setShowWizard(false);
          loadCampaigns();
        }}
      />
    );
  }

  if (selectedCampaign) {
    return (
      <PhishingCampaignDetail
        campaignId={selectedCampaign.id}
        userData={userData}
        accessToken={accessToken}
        onClose={() => {
          setSelectedCampaign(null);
          loadCampaigns();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Aucune campagne</h3>
          <p className="text-gray-600 mb-6">
            Créez votre première campagne de test de phishing pour évaluer la vigilance de vos collaborateurs
          </p>
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Créer ma première campagne
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Header */}
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
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle campagne
        </Button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Nom de la campagne
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Destinataires
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Taux de clic
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Signalements
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => {
              const startDate = new Date(campaign.startDate).toLocaleDateString('fr-FR');
              const endDate = campaign.endDate 
                ? new Date(campaign.endDate).toLocaleDateString('fr-FR')
                : 'En cours';

              return (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-gray-900">{campaign.name}</div>
                      {campaign.description && (
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {startDate} - {endDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {campaign.recipientCount || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    —
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    —
                  </td>
                  <td className="px-6 py-4">
                    —
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {campaign.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLaunchCampaign(campaign.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {campaign.status === 'running' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStopCampaign(campaign.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {(campaign.status === 'draft' || campaign.status === 'completed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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
