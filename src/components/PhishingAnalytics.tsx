import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface PhishingAnalyticsProps {
  userData: any;
  accessToken: string;
}

export function PhishingAnalytics({ userData, accessToken }: PhishingAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/phishing/analytics`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaturityBadge = (score: string) => {
    const config: Record<string, { className: string; icon: any; label: string }> = {
      'A': { className: 'bg-green-100 text-green-700 border-green-300', icon: TrendingUp, label: 'Excellent' },
      'B': { className: 'bg-blue-100 text-blue-700 border-blue-300', icon: TrendingUp, label: 'Bon' },
      'C': { className: 'bg-orange-100 text-orange-700 border-orange-300', icon: Minus, label: 'Moyen' },
      'D': { className: 'bg-red-100 text-red-700 border-red-300', icon: TrendingDown, label: 'À améliorer' },
      'N/A': { className: 'bg-gray-100 text-gray-700 border-gray-300', icon: AlertCircle, label: 'Pas de données' },
    };

    const { className, icon: Icon, label } = config[score] || config['N/A'];
    return (
      <div className={`border-2 ${className} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm uppercase tracking-wide">Score de maturité</div>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-5xl mb-2">{score}</div>
        <div className="text-sm">{label}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics || analytics.totalCampaigns === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">Aucune donnée analytique</h3>
        <p className="text-gray-600">
          Lancez votre première campagne pour voir les statistiques et analyses apparaître ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 text-sm mb-2">Campagnes totales</div>
          <div className="text-3xl text-gray-900">{analytics.totalCampaigns}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 text-sm mb-2">Destinataires totaux</div>
          <div className="text-3xl text-gray-900">{analytics.totalRecipients}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 text-sm mb-2">Taux d'ouverture</div>
          <div className="text-3xl text-gray-900">{analytics.rates.openRate}%</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 text-sm mb-2">Taux de clic</div>
          <div className="text-3xl text-red-600">{analytics.rates.clickRate}%</div>
          <div className="text-xs text-red-600 mt-1">Plus le taux est bas, mieux c'est</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 text-sm mb-2">Taux de signalement</div>
          <div className="text-3xl text-green-600">{analytics.rates.reportRate}%</div>
          <div className="text-xs text-green-600 mt-1">Plus le taux est haut, mieux c'est</div>
        </div>
      </div>

      {/* Maturity Score */}
      {getMaturityBadge(analytics.maturityScore)}

      {/* Behavior Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-6">Répartition globale des comportements</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <div className="text-3xl text-gray-900 mb-2">{analytics.rates.reportRate}%</div>
            <div className="text-sm text-gray-600">
              A détecté et signalé
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Comportement sécurisé
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <div className="text-3xl text-gray-900 mb-2">{analytics.rates.clickRate}%</div>
            <div className="text-sm text-gray-600">
              A cliqué sur le lien
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Comportement à risque
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">📥</div>
            <div className="text-3xl text-gray-900 mb-2">{analytics.rates.submitRate}%</div>
            <div className="text-sm text-gray-600">
              A saisi des données
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Comportement critique
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-3">👁️</div>
            <div className="text-3xl text-gray-900 mb-2">{analytics.rates.openRate}%</div>
            <div className="text-sm text-gray-600">
              A ouvert l'e-mail
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Comportement neutre
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommandations
        </h3>
        <div className="space-y-3">
          {analytics.rates.clickRate > 20 && (
            <div className="flex items-start gap-3">
              <div className="text-blue-600">•</div>
              <div className="text-blue-800">
                <strong>Taux de clic élevé ({analytics.rates.clickRate}%) :</strong> Envisagez des sessions de sensibilisation ciblées 
                sur la détection des e-mails de phishing.
              </div>
            </div>
          )}
          {analytics.rates.reportRate < 10 && (
            <div className="flex items-start gap-3">
              <div className="text-blue-600">•</div>
              <div className="text-blue-800">
                <strong>Taux de signalement faible ({analytics.rates.reportRate}%) :</strong> Communiquez sur l'importance 
                de signaler les e-mails suspects et facilitez le processus de signalement.
              </div>
            </div>
          )}
          {analytics.rates.submitRate > 5 && (
            <div className="flex items-start gap-3">
              <div className="text-blue-600">•</div>
              <div className="text-blue-800">
                <strong>Saisie de données observée ({analytics.rates.submitRate}%) :</strong> Formez vos collaborateurs 
                à ne jamais saisir d'identifiants sur une page suspecte.
              </div>
            </div>
          )}
          {analytics.maturityScore === 'A' && (
            <div className="flex items-start gap-3">
              <div className="text-blue-600">•</div>
              <div className="text-blue-800">
                <strong>Excellent score de maturité !</strong> Maintenez ce niveau en organisant des tests réguliers 
                et en variant les scénarios de phishing.
              </div>
            </div>
          )}
          {analytics.totalCampaigns < 3 && (
            <div className="flex items-start gap-3">
              <div className="text-blue-600">•</div>
              <div className="text-blue-800">
                <strong>Peu de campagnes réalisées :</strong> Pour une évaluation plus fiable, effectuez des tests 
                réguliers (au moins 3-4 fois par an) avec des scénarios variés.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaigns History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Historique des campagnes</h3>
        <div className="space-y-3">
          {analytics.campaigns.slice(0, 10).map((campaign: any) => (
            <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-gray-900">{campaign.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(campaign.createdAt).toLocaleDateString('fr-FR')} • {campaign.recipientCount} destinataires
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  campaign.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                  campaign.status === 'running' ? 'bg-green-100 text-green-700' :
                  campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {campaign.status === 'completed' ? 'Terminée' :
                   campaign.status === 'running' ? 'En cours' :
                   campaign.status === 'draft' ? 'Brouillon' : 'Programmée'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
