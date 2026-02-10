import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FieldHelp } from './FieldHelp';
import { traitementHelp } from '../utils/fieldHelp';

interface TraitementFormModalProps {
  traitement?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function TraitementFormModal({ traitement, onClose, onSave }: TraitementFormModalProps) {
  const [formData, setFormData] = useState({
    nom: traitement?.nom || '',
    finalite: traitement?.finalite || '',
    personnesConcernees: traitement?.personnesConcernees || '',
    baseJuridique: traitement?.baseJuridique || 'Contrat',
    dureeConservation: traitement?.dureeConservation || '',
    categoriesDonnees: traitement?.categoriesDonnees || [],
    mesuresSecurite: traitement?.mesuresSecurite || [],
    statut: traitement?.statut || 'À jour',
  });

  const [newCategorie, setNewCategorie] = useState('');
  const [newMesure, setNewMesure] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving traitement:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addCategorie = () => {
    if (newCategorie.trim() && !formData.categoriesDonnees.includes(newCategorie.trim())) {
      setFormData({
        ...formData,
        categoriesDonnees: [...formData.categoriesDonnees, newCategorie.trim()]
      });
      setNewCategorie('');
    }
  };

  const removeCategorie = (cat: string) => {
    setFormData({
      ...formData,
      categoriesDonnees: formData.categoriesDonnees.filter(c => c !== cat)
    });
  };

  const addMesure = () => {
    if (newMesure.trim() && !formData.mesuresSecurite.includes(newMesure.trim())) {
      setFormData({
        ...formData,
        mesuresSecurite: [...formData.mesuresSecurite, newMesure.trim()]
      });
      setNewMesure('');
    }
  };

  const removeMesure = (mesure: string) => {
    setFormData({
      ...formData,
      mesuresSecurite: formData.mesuresSecurite.filter(m => m !== mesure)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">
            {traitement ? 'Modifier le traitement' : 'Nouveau traitement'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Nom du traitement <span className="text-red-500">*</span></span>
              <FieldHelp fieldKey="nom" helpContent={traitementHelp.nom} />
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Finalité */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Finalité <span className="text-red-500">*</span></span>
              <FieldHelp fieldKey="finalite" helpContent={traitementHelp.finalite} />
            </label>
            <textarea
              value={formData.finalite}
              onChange={(e) => setFormData({ ...formData, finalite: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personnes concernées */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Personnes concernées <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="personnesConcernees" helpContent={traitementHelp.personnesConcernees} />
              </label>
              <input
                type="text"
                value={formData.personnesConcernees}
                onChange={(e) => setFormData({ ...formData, personnesConcernees: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Base juridique */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Base juridique <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="baseJuridique" helpContent={traitementHelp.baseJuridique} />
              </label>
              <select
                value={formData.baseJuridique}
                onChange={(e) => setFormData({ ...formData, baseJuridique: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Contrat">Contrat</option>
                <option value="Consentement">Consentement</option>
                <option value="Obligation légale">Obligation légale</option>
                <option value="Intérêt légitime">Intérêt légitime</option>
                <option value="Mission d'intérêt public">Mission d'intérêt public</option>
                <option value="Sauvegarde des intérêts vitaux">Sauvegarde des intérêts vitaux</option>
              </select>
            </div>

            {/* Durée de conservation */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Durée de conservation <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="dureeConservation" helpContent={traitementHelp.dureeConservation} />
              </label>
              <input
                type="text"
                value={formData.dureeConservation}
                onChange={(e) => setFormData({ ...formData, dureeConservation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 3 ans"
                required
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Statut <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="statut" helpContent={traitementHelp.statut} />
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="À jour">À jour</option>
                <option value="Révision nécessaire">Révision nécessaire</option>
              </select>
            </div>
          </div>

          {/* Catégories de données */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Catégories de données</span>
              <FieldHelp fieldKey="categoriesDonnees" helpContent={traitementHelp.categoriesDonnees} />
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCategorie}
                onChange={(e) => setNewCategorie(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategorie())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Identité, Coordonnées..."
              />
              <Button type="button" onClick={addCategorie} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.categoriesDonnees.map((cat, idx) => (
                <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeCategorie(cat)}>
                  {cat} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Mesures de sécurité */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Mesures de sécurité</span>
              <FieldHelp fieldKey="mesuresSecurite" helpContent={traitementHelp.mesuresSecurite} />
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMesure}
                onChange={(e) => setNewMesure(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMesure())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Chiffrement, Contrôle d'accès..."
              />
              <Button type="button" onClick={addMesure} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.mesuresSecurite.map((mesure, idx) => (
                <Badge key={idx} variant="secondary" className="cursor-pointer bg-green-50 text-green-700" onClick={() => removeMesure(mesure)}>
                  {mesure} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
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