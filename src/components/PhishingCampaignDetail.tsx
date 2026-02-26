import { useState, useEffect } from 'react';
import { ArrowLeft, Users, MousePointerClick, CheckCircle, Eye, Download } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PhishingCampaignDetailProps {
  campaignId: string;
  userData: any;
  onClose: () => void;
}

export function PhishingCampaignDetail({ campaignId, userData, onClose }: PhishingCampaignDetailProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientFilter, setRecipientFilter] = useState('all');

  useEffect(() => { loadCampaign(); }, []);

  const loadCampaign = async () => {
    try {
      setLoading(true);

      const { data: camp, error: campError } = await supabase
        .from('phishing_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      if (campError) throw campError;

      const { data: recs, error: recError } = await supabase
        .from('phishing_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at');
      if (recError) throw recError;

      setCampaign(camp);
      setRecipients(recs || []);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Erreur lors du chargement de la campagne');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!campaign) return (
    <div className="text-center py-12">
      <p className="text-gray-600">Campagne non trouvée</p>
      <Button onClick={onClose} className="mt-4">Retour</Button>
    </div>
  );

  const totalRecipients = recipients.length;
  const opened = recipients.filter(r => r.opened).length;
  const clicked = recipients.filter(r => r.clicked).length;
  const submitted = recipients.filter(r => r.submitted).length;
  const reported = recipients.filter(r => r.reported).length;
  const noAction = recipients.filter(r => !r.opened && !r.clicked && !r.reported).length;

  const openRate = totalRecipients > 0 ? ((opened / totalRecipients) * 100).toFixed(1) : 0;
  const clickRate = totalRecipients > 0 ? ((clicked / totalRecipients) * 100).toFixed(1) : 0;
  const reportRate = totalRecipients > 0 ? ((reported / totalRecipients) * 100).toFixed(1) : 0;

  const filteredRecipients = recipientFilter === 'all' ? recipients : recipients.filter(r => {
    if (recipientFilter === 'clicked') return r.clicked;
    if (recipientFilter === 'reported') return r.reported;
    if (recipientFilter === 'opened') return r.opened;
    if (recipientFilter === 'noaction') return !r.opened && !r.clicked && !r.reported;
    return true;
  });

  const getStatusBadge = (recipient: any) => {
    if (recipient.reported) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">✓ Signalé</span>;
    if (recipient.clicked) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">⚠ A cliqué</span>;
    if (recipient.opened) return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">👁 A ouvert</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">— Aucune action</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
          <div>
            <h2 className="text-gray-900">{campaign.name}</h2>
            {campaign.description && <p className="text-gray-600">{campaign.description}</p>}
          </div>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exporter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2"><div className="text-gray-600 text-sm">Destinataires</div><Users className="h-5 w-5 text-gray-400" /></div>
          <div className="text-3xl text-gray-900">{totalRecipients}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2"><div className="text-gray-600 text-sm">Taux d'ouverture</div><Eye className="h-5 w-5 text-orange-500" /></div>
          <div className="text-3xl text-gray-900">{openRate}%</div>
          <div className="text-sm text-gray-500 mt-1">{opened} ouvertures</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2"><div className="text-gray-600 text-sm">Taux de clic</div><MousePointerClick className="h-5 w-5 text-red-500" /></div>
          <div className="text-3xl text-gray-900">{clickRate}%</div>
          <div className="text-sm text-gray-500 mt-1">{clicked} clics</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2"><div className="text-gray-600 text-sm">Taux de signalement</div><CheckCircle className="h-5 w-5 text-green-500" /></div>
          <div className="text-3xl text-gray-900">{reportRate}%</div>
          <div className="text-sm text-gray-500 mt-1">{reported} signalements</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Répartition des comportements</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center"><div className="text-3xl mb-2">✅</div><div className="text-2xl text-gray-900">{reported}</div><div className="text-sm text-gray-600">A détecté et signalé</div></div>
          <div className="text-center"><div className="text-3xl mb-2">⚠️</div><div className="text-2xl text-gray-900">{clicked - reported}</div><div className="text-sm text-gray-600">A cliqué sans signaler</div></div>
          <div className="text-center"><div className="text-3xl mb-2">👁️</div><div className="text-2xl text-gray-900">{opened - clicked}</div><div className="text-sm text-gray-600">A ouvert sans cliquer</div></div>
          <div className="text-center"><div className="text-3xl mb-2">—</div><div className="text-2xl text-gray-900">{noAction}</div><div className="text-sm text-gray-600">Aucune action</div></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900">Détail des destinataires</h3>
          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous ({totalRecipients})</option>
            <option value="clicked">A cliqué ({clicked})</option>
            <option value="reported">A signalé ({reported})</option>
            <option value="opened">A ouvert ({opened})</option>
            <option value="noaction">Aucune action ({noAction})</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Nom / Email</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Ouverture</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Clic</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Signalement</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecipients.map((recipient: any) => (
                <tr key={recipient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{recipient.name || '—'}</div>
                    <div className="text-sm text-gray-500">{recipient.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{recipient.department || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {recipient.opened ? <div className="text-gray-900"><Eye className="h-4 w-4 inline mr-1 text-orange-500" />{new Date(recipient.opened_at).toLocaleString('fr-FR')}</div> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {recipient.clicked ? <div className="text-gray-900"><MousePointerClick className="h-4 w-4 inline mr-1 text-red-500" />{new Date(recipient.clicked_at).toLocaleString('fr-FR')}</div> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {recipient.reported ? <div className="text-gray-900"><CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />{new Date(recipient.reported_at).toLocaleString('fr-FR')}</div> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(recipient)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRecipients.length === 0 && <div className="p-8 text-center text-gray-500">Aucun destinataire ne correspond à ce filtre</div>}
      </div>
    </div>
  );
}