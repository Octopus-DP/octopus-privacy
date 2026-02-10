import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, MousePointerClick, AlertCircle, CheckCircle, Eye, EyeOff, Download, Copy, Link } from 'lucide-react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';

interface PhishingCampaignDetailProps {
  campaignId: string;
  userData: any;
  accessToken: string;
  onClose: () => void;
}

export function PhishingCampaignDetail({ campaignId, userData, accessToken, onClose }: PhishingCampaignDetailProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recipientFilter, setRecipientFilter] = useState('all');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/phishing/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      if (data.success) {
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Campagne non trouvée</p>
        <Button onClick={onClose} className="mt-4">Retour</Button>
      </div>
    );
  }

  const stats = campaign.stats || {
    totalRecipients: 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
    reported: 0,
    noAction: 0
  };

  const openRate = stats.totalRecipients > 0 ? ((stats.opened / stats.totalRecipients) * 100).toFixed(1) : 0;
  const clickRate = stats.totalRecipients > 0 ? ((stats.clicked / stats.totalRecipients) * 100).toFixed(1) : 0;
  const submitRate = stats.totalRecipients > 0 ? ((stats.submitted / stats.totalRecipients) * 100).toFixed(1) : 0;
  const reportRate = stats.totalRecipients > 0 ? ((stats.reported / stats.totalRecipients) * 100).toFixed(1) : 0;

  const recipients = campaign.recipients || [];
  const filteredRecipients = recipientFilter === 'all' ? recipients : recipients.filter((r: any) => {
    if (recipientFilter === 'clicked') return r.clicked;
    if (recipientFilter === 'reported') return r.reported;
    if (recipientFilter === 'opened') return r.opened;
    if (recipientFilter === 'noaction') return !r.opened && !r.clicked && !r.reported;
    return true;
  });

  const getStatusBadge = (recipient: any) => {
    if (recipient.reported) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">✓ Signalé</span>;
    }
    if (recipient.clicked) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">⚠ A cliqué</span>;
    }
    if (recipient.opened) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">👁 A ouvert</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">— Aucune action</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h2 className="text-gray-900">{campaign.name}</h2>
            <p className="text-gray-600">{campaign.description}</p>
            <p className="text-xs text-gray-400 mt-1">Campagne ID: {campaignId}</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Destinataires</div>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl text-gray-900">{stats.totalRecipients}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Taux d'ouverture</div>
            <Eye className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl text-gray-900">{openRate}%</div>
          <div className="text-sm text-gray-500 mt-1">{stats.opened} ouvertures</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Taux de clic</div>
            <MousePointerClick className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl text-gray-900">{clickRate}%</div>
          <div className="text-sm text-gray-500 mt-1">{stats.clicked} clics</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 text-sm">Taux de signalement</div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl text-gray-900">{reportRate}%</div>
          <div className="text-sm text-gray-500 mt-1">{stats.reported} signalements</div>
        </div>
      </div>

      {/* Behavior Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Répartition des comportements</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl text-gray-900">{stats.reported}</div>
            <div className="text-sm text-gray-600">A détecté et signalé</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-2xl text-gray-900">{stats.clicked - stats.reported}</div>
            <div className="text-sm text-gray-600">A cliqué sans signaler</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-2xl text-gray-900">{stats.opened - stats.clicked}</div>
            <div className="text-sm text-gray-600">A ouvert sans cliquer</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">—</div>
            <div className="text-2xl text-gray-900">{stats.noAction}</div>
            <div className="text-sm text-gray-600">Aucune action</div>
          </div>
        </div>
      </div>

      {/* Recipients Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900">Détail des destinataires</h3>
          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous ({recipients.length})</option>
            <option value="clicked">A cliqué ({stats.clicked})</option>
            <option value="reported">A signalé ({stats.reported})</option>
            <option value="opened">A ouvert ({stats.opened})</option>
            <option value="noaction">Aucune action ({stats.noAction})</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Nom / Email
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Ouverture
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Clic
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Signalement
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Debug
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecipients.map((recipient: any) => (
                <tr key={recipient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-gray-900">{recipient.name || '—'}</div>
                      <div className="text-sm text-gray-500">{recipient.email}</div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">ID: {recipient.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {recipient.department || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {recipient.opened ? (
                      <div className="text-gray-900">
                        <Eye className="h-4 w-4 inline mr-1 text-orange-500" />
                        {new Date(recipient.openedAt).toLocaleString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {recipient.clicked ? (
                      <div className="text-gray-900">
                        <MousePointerClick className="h-4 w-4 inline mr-1 text-red-500" />
                        {new Date(recipient.clickedAt).toLocaleString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {recipient.reported ? (
                      <div className="text-gray-900">
                        <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                        {new Date(recipient.reportedAt).toLocaleString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(recipient)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const url = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/click/${campaignId}/${recipient.id}`;
                          navigator.clipboard.writeText(url);
                          alert('URL de test copiée !\n\n' + url);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Copier l'URL de test du lien"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={`https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/click/${campaignId}/${recipient.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Tester le lien (nouvel onglet)"
                      >
                        <Link className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecipients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun destinataire ne correspond à ce filtre
          </div>
        )}
      </div>
    </div>
  );
}
