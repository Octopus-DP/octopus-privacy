import { useState } from 'react';
import { Fish, BarChart3, Mail, Settings } from 'lucide-react';
import { PhishingCampaignList } from './PhishingCampaignList';
import { PhishingAnalytics } from './PhishingAnalytics';
import { PhishingTemplates } from './PhishingTemplates';

interface PhishingDashboardProps {
  userData: any;
  entityId: string;
}

type PhishingTab = 'campaigns' | 'analytics' | 'templates';

export function PhishingDashboard({ userData, entityId }: PhishingDashboardProps) {
  const [activeTab, setActiveTab] = useState<PhishingTab>('campaigns');

  const tabs = [
    { id: 'campaigns' as PhishingTab, label: 'Campagnes', icon: Fish },
    { id: 'analytics' as PhishingTab, label: 'Analyses & Rapports', icon: BarChart3 },
    { id: 'templates' as PhishingTab, label: "Modèles d'e-mails", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 flex items-center gap-3">
            <Fish className="h-8 w-8 text-blue-600" />
            Tests de Phishing
          </h1>
          <p className="text-gray-600 mt-2">
            Évaluez et améliorez la vigilance de vos collaborateurs face aux menaces de phishing
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {activeTab === 'campaigns' && <PhishingCampaignList userData={userData} entityId={entityId} />}
        {activeTab === 'analytics' && <PhishingAnalytics userData={userData} />}
        {activeTab === 'templates' && <PhishingTemplates userData={userData} />}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-blue-900 mb-1">Conformité RGPD</h3>
            <p className="text-blue-800 text-sm">
              Les tests de phishing sont réalisés dans le cadre de l'intérêt légitime de l'entreprise 
              pour assurer la sécurité des systèmes d'information. Les données collectées sont 
              limitées au strict nécessaire et conservées de manière sécurisée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}