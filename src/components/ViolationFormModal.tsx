import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FieldHelp } from './FieldHelp';
import { violationHelp } from '../utils/fieldHelp';

interface ViolationFormModalProps {
  violation?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function ViolationFormModal({ violation, onClose, onSave }: ViolationFormModalProps) {
  const [formData, setFormData] = useState({
    titre: violation?.titre || '',
    dateDetection: violation?.dateDetection || new Date().toISOString().split('T')[0],
    dateNotificationCNIL: violation?.dateNotificationCNIL || '',
    gravite: violation?.gravite || 'Moyenne',
    statut: violation?.statut || 'Nouvelle',
    personnesImpactees: violation?.personnesImpactees || 0,
    typeDonnees: violation?.typeDonnees || [],
    description: violation?.description || '',
    mesuresPrises: violation?.mesuresPrises || [],
    notificationCNIL: violation?.notificationCNIL || false,
    notificationPersonnes: violation?.notificationPersonnes || false,
  });

  const [newType, setNewType] = useState('');
  const [newMesure, setNewMesure] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving violation:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addType = () => {
    if (newType.trim() && !formData.typeDonnees.includes(newType.trim())) {
      setFormData({
        ...formData,
        typeDonnees: [...formData.typeDonnees, newType.trim()]
      });
      setNewType('');
    }
  };

  const removeType = (type: string) => {
    setFormData({
      ...formData,
      typeDonnees: formData.typeDonnees.filter(t => t !== type)
    });
  };

  const addMesure = () => {
    if (newMesure.trim() && !formData.mesuresPrises.includes(newMesure.trim())) {
      setFormData({
        ...formData,
        mesuresPrises: [...formData.mesuresPrises, newMesure.trim()]
      });
      setNewMesure('');
    }
  };

  const removeMesure = (mesure: string) => {
    setFormData({
      ...formData,
      mesuresPrises: formData.mesuresPrises.filter(m => m !== mesure)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">
            {violation ? 'Modifier la violation' : 'Nouvelle violation de données'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Titre <span className="text-red-500">*</span></span>
              <FieldHelp fieldKey="titre" helpContent={violationHelp.titre} />
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Description <span className="text-red-500">*</span></span>
              <FieldHelp fieldKey="description" helpContent={violationHelp.description} />
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Gravité <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="gravite" helpContent={violationHelp.gravite} />
              </label>
              <select
                value={formData.gravite}
                onChange={(e) => setFormData({ ...formData, gravite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Élevée">Élevée</option>
                <option value="Critique">Critique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Statut <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="statut" helpContent={violationHelp.statut} />
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Nouvelle">Nouvelle</option>
                <option value="En cours">En cours</option>
                <option value="Résolue">Résolue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Personnes impactées <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="personnesImpactees" helpContent={violationHelp.personnesImpactees} />
              </label>
              <input
                type="number"
                value={formData.personnesImpactees}
                onChange={(e) => setFormData({ ...formData, personnesImpactees: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Date de détection <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="dateDetection" helpContent={violationHelp.dateDetection} />
              </label>
              <input
                type="date"
                value={formData.dateDetection}
                onChange={(e) => setFormData({ ...formData, dateDetection: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Date notification CNIL</span>
                <FieldHelp fieldKey="dateNotificationCNIL" helpContent={violationHelp.dateNotificationCNIL} />
              </label>
              <input
                type="date"
                value={formData.dateNotificationCNIL}
                onChange={(e) => setFormData({ ...formData, dateNotificationCNIL: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Types de données concernées</span>
              <FieldHelp fieldKey="typeDonnees" helpContent={violationHelp.typeDonnees} />
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addType())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Identité, Email..."
              />
              <Button type="button" onClick={addType} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.typeDonnees.map((type, idx) => (
                <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeType(type)}>
                  {type} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Mesures correctives prises</span>
              <FieldHelp fieldKey="mesuresPrises" helpContent={violationHelp.mesuresPrises} />
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMesure}
                onChange={(e) => setNewMesure(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMesure())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Réinitialisation des mots de passe..."
              />
              <Button type="button" onClick={addMesure} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.mesuresPrises.map((mesure, idx) => (
                <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeMesure(mesure)}>
                  {mesure} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="notificationCNIL"
                checked={formData.notificationCNIL}
                onChange={(e) => setFormData({ ...formData, notificationCNIL: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="notificationCNIL" className="text-sm text-gray-700 flex items-center justify-between">
                  <span>CNIL notifiée</span>
                  <FieldHelp fieldKey="notificationCNIL" helpContent={violationHelp.notificationCNIL} />
                </label>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="notificationPersonnes"
                checked={formData.notificationPersonnes}
                onChange={(e) => setFormData({ ...formData, notificationPersonnes: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="notificationPersonnes" className="text-sm text-gray-700 flex items-center justify-between">
                  <span>Personnes notifiées</span>
                  <FieldHelp fieldKey="notificationPersonnes" helpContent={violationHelp.notificationPersonnes} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}