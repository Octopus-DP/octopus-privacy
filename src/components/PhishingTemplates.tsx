import { useState, useEffect } from 'react';
import { Mail, Eye, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';

interface PhishingTemplatesProps {
  userData: any;
  accessToken: string;
}

export function PhishingTemplates({ userData, accessToken }: PhishingTemplatesProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/phishing/templates`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: Record<string, { label: string; className: string }> = {
      delivery: { label: 'Livraison', className: 'bg-yellow-100 text-yellow-700' },
      security: { label: 'Sécurité', className: 'bg-red-100 text-red-700' },
      finance: { label: 'Finance', className: 'bg-blue-100 text-blue-700' },
      hr: { label: 'RH', className: 'bg-green-100 text-green-700' },
      executive: { label: 'Direction', className: 'bg-purple-100 text-purple-700' },
      custom: { label: 'Personnalisé', className: 'bg-gray-100 text-gray-700' },
    };

    const config = categoryConfig[category] || categoryConfig.custom;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900">{selectedTemplate.name}</h3>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            Retour à la liste
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Catégorie</label>
              <div className="mt-1">
                {getCategoryBadge(selectedTemplate.category)}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Nom de l'expéditeur</label>
              <div className="mt-1 text-gray-900">{selectedTemplate.senderName}</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Email de l'expéditeur</label>
              <div className="mt-1 text-gray-900">{selectedTemplate.senderEmail}</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Objet de l'e-mail</label>
              <div className="mt-1 text-gray-900">{selectedTemplate.subject}</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Aperçu du contenu HTML</label>
              <div className="mt-2 border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }} />
              </div>
            </div>

            {selectedTemplate.isGlobal && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Modèle global :</strong> Ce modèle est fourni par Octopus Data & Privacy 
                  et est disponible pour tous les clients.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900">Modèles d'e-mails</h3>
          <p className="text-gray-600 text-sm mt-1">
            Choisissez parmi les modèles prédéfinis ou créez vos propres scénarios
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Créer un modèle personnalisé
          <span className="ml-2 text-xs opacity-60">(Bientôt)</span>
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h4 className="text-gray-900">{template.name}</h4>
                </div>
                {getCategoryBadge(template.category)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">De :</span>{' '}
                  <span className="text-gray-900">{template.senderName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Objet :</span>{' '}
                  <span className="text-gray-900">{template.subject}</span>
                </div>
              </div>

              {template.isGlobal && (
                <div className="mb-4">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    Modèle Octopus
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedTemplate(template)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Prévisualiser
              </Button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Aucun modèle disponible</h3>
          <p className="text-gray-600">
            Les modèles par défaut sont en cours de chargement...
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-gray-900 mb-3">À propos des modèles de phishing</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Modèles prédéfinis :</strong> Nous fournissons 5 scénarios classiques inspirés 
            des attaques de phishing les plus courantes (livraison, mot de passe, facture, RH, direction).
          </p>
          <p>
            <strong>Variables dynamiques :</strong> Les modèles utilisent des variables comme {'{'}{'{'} Prénom {'}'}{'}'},  
            {'{'}{'{'} Nom_entreprise {'}'}{'}'} qui sont automatiquement remplacées lors de l'envoi.
          </p>
          <p>
            <strong>Personnalisation :</strong> Vous pourrez bientôt créer vos propres modèles adaptés 
            à votre contexte d'entreprise.
          </p>
        </div>
      </div>
    </div>
  );
}
