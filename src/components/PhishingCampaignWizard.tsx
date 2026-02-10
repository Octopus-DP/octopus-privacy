import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, X, Upload, Users, Mail, Calendar, AlertTriangle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';

interface PhishingCampaignWizardProps {
  userData: any;
  accessToken: string;
  entityId: string;
  onClose: () => void;
}

interface Recipient {
  email: string;
  name: string;
  department: string;
  site: string;
  included: boolean;
}

export function PhishingCampaignWizard({ userData, accessToken, entityId, onClose }: PhishingCampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Step 1: General Information
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('general_awareness');
  const [responsible, setResponsible] = useState(userData.email);

  // Step 2: Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [csvInput, setCsvInput] = useState('');

  // Step 3: Template
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [showEducationalMessage, setShowEducationalMessage] = useState(true);

  // Step 4: Planning
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sendMode, setSendMode] = useState('immediate');
  const [trackingOptions, setTrackingOptions] = useState({
    opens: true,
    clicks: true,
    submissions: true,
    reports: true
  });
  const [privacyLevel, setPrivacyLevel] = useState('individual');
  const [anonymize, setAnonymize] = useState(false);
  const [autoSensitization, setAutoSensitization] = useState(false);
  const [rgpdConfirmation, setRgpdConfirmation] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${apiUrl}/phishing/templates`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleCsvUpload = () => {
    try {
      const lines = csvInput.trim().split('\n');
      const newRecipients: Recipient[] = [];

      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        const [email, name, department, site] = line.split(',').map(s => s.trim());
        if (email && email.includes('@')) {
          newRecipients.push({
            email,
            name: name || '',
            department: department || '',
            site: site || '',
            included: true
          });
        }
      });

      setRecipients(newRecipients);
      setCsvInput('');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Erreur lors du parsing du CSV');
    }
  };

  const addManualRecipient = () => {
    setRecipients([...recipients, {
      email: '',
      name: '',
      department: '',
      site: '',
      included: true
    }]);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: any) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setSenderName(template.senderName);
    setSenderEmail(template.senderEmail);
    setEmailSubject(template.subject);
  };

  const handleSubmit = async () => {
    if (!rgpdConfirmation) {
      alert('Veuillez confirmer la conformité RGPD');
      return;
    }

    const includedRecipients = recipients.filter(r => r.included && r.email);

    if (includedRecipients.length === 0) {
      alert('Veuillez ajouter au moins un destinataire');
      return;
    }

    if (!selectedTemplate) {
      alert('Veuillez sélectionner un modèle d\'e-mail');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/phishing/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName,
          description,
          objective,
          entityId,
          responsibleEmail: responsible,
          templateId: selectedTemplate.id,
          landingPageId: showEducationalMessage ? 'default' : null,
          startDate,
          endDate,
          sendMode,
          recipients: includedRecipients,
          tracking: trackingOptions,
          privacy: {
            granularity: privacyLevel,
            anonymize
          },
          autoSensitization: {
            enabled: autoSensitization
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await response.json();
      if (data.success) {
        alert('✅ Campagne créée avec succès !');
        onClose();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Erreur lors de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Informations générales', icon: AlertTriangle },
    { number: 2, title: 'Destinataires', icon: Users },
    { number: 3, title: 'Modèle d\'e-mail', icon: Mail },
    { number: 4, title: 'Planification', icon: Calendar },
  ];

  const canGoNext = () => {
    if (currentStep === 1) {
      return campaignName.trim() !== '';
    }
    if (currentStep === 2) {
      return recipients.some(r => r.included && r.email);
    }
    if (currentStep === 3) {
      return selectedTemplate !== null;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Nouvelle campagne de phishing</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-600' : isActive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                        Étape {step.number}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: General Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nom de la campagne <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Test de phishing T1 2025"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Description (facultatif)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Objectif et contexte de cette campagne..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Objectif principal
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="general_awareness">Sensibilisation générale</option>
                  <option value="annual_assessment">Évaluation annuelle</option>
                  <option value="post_incident">Suivi après incident</option>
                  <option value="targeted_test">Test ciblé sur un service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Responsable de la campagne
                </label>
                <input
                  type="email"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step 2: Recipients */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-900 text-sm mb-1">Information RGPD</h4>
                    <p className="text-blue-800 text-sm">
                      Les tests de phishing sont réalisés dans le cadre de l'intérêt légitime pour la sécurité.
                      Les collaborateurs doivent être informés de la mise en place de ces tests.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Importer depuis un CSV
                </label>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="email,nom,service,site&#10;jean.dupont@example.com,Jean Dupont,IT,Paris&#10;marie.martin@example.com,Marie Martin,RH,Lyon"
                />
                <Button size="sm" className="mt-2" onClick={handleCsvUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer le CSV
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Destinataires ({recipients.filter(r => r.included).length})</h3>
                <Button size="sm" variant="outline" onClick={addManualRecipient}>
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter manuellement
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-2 text-xs text-gray-500 uppercase">Inclure</th>
                      <th className="px-4 py-2 text-xs text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-xs text-gray-500 uppercase">Nom</th>
                      <th className="px-4 py-2 text-xs text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-2 text-xs text-gray-500 uppercase">Site</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recipients.map((recipient, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={recipient.included}
                            onChange={(e) => updateRecipient(index, 'included', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="email@example.com"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Nom complet"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={recipient.department}
                            onChange={(e) => updateRecipient(index, 'department', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Service"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={recipient.site}
                            onChange={(e) => updateRecipient(index, 'site', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Site"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeRecipient(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {recipients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun destinataire ajouté. Importez un CSV ou ajoutez manuellement.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Template */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-900 mb-4">Choisissez un modèle d'e-mail</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <h4 className="text-gray-900">{template.name}</h4>
                      </div>
                      <div className="text-xs text-gray-500 uppercase mb-2">
                        {template.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Objet :</strong> {template.subject}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Nom de l'expéditeur
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Email de l'expéditeur
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ⚠️ L'adresse email doit être vérifiée dans Mailjet pour que l'envoi fonctionne
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Objet de l'e-mail
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showEducationalMessage}
                        onChange={(e) => setShowEducationalMessage(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Afficher un message pédagogique immédiat après le clic
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Planning */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Date de fin (facultatif)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mode d'envoi
                </label>
                <select
                  value={sendMode}
                  onChange={(e) => setSendMode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="immediate">Envoi immédiat à tous</option>
                  <option value="staggered">Envois étalés (sur plusieurs jours)</option>
                </select>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3">Options de suivi</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={trackingOptions.opens}
                      onChange={(e) => setTrackingOptions({...trackingOptions, opens: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Suivre les ouvertures d'e-mails</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={trackingOptions.clicks}
                      onChange={(e) => setTrackingOptions({...trackingOptions, clicks: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Suivre les clics sur les liens</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={trackingOptions.submissions}
                      onChange={(e) => setTrackingOptions({...trackingOptions, submissions: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Suivre les saisies de données</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={trackingOptions.reports}
                      onChange={(e) => setTrackingOptions({...trackingOptions, reports: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Suivre les signalements</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3">Paramètres de confidentialité</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Niveau de granularité des rapports
                  </label>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="individual">Individuel nominatif</option>
                    <option value="department">Agrégé par service</option>
                    <option value="global">Agrégé globalement</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    checked={anonymize}
                    onChange={(e) => setAnonymize(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Anonymiser les résultats individuels dans les rapports
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoSensitization}
                    onChange={(e) => setAutoSensitization(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Envoyer automatiquement un e-mail de sensibilisation aux personnes ayant cliqué
                  </span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={rgpdConfirmation}
                    onChange={(e) => setRgpdConfirmation(e.target.checked)}
                    className="rounded border-gray-300 mt-1"
                  />
                  <div>
                    <span className="text-sm text-gray-900">
                      Je confirme que les représentants du personnel et/ou les instances appropriées 
                      ont été informés de la mise en place de ces tests de phishing, et que la notice 
                      d'information aux collaborateurs a été communiquée.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                onClose();
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 4 && (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canGoNext()}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentStep === 4 && (
              <>
                <Button variant="outline" onClick={handleSubmit} disabled={loading || !canGoNext()}>
                  Sauvegarder comme brouillon
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !canGoNext()}>
                  {loading ? 'Création...' : 'Lancer la campagne'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}