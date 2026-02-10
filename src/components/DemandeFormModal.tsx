import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from './ui/button';
import { FieldHelp } from './FieldHelp';
import { demandeHelp } from '../utils/fieldHelp';

interface DemandeFormModalProps {
  demande?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function DemandeFormModal({ demande, onClose, onSave }: DemandeFormModalProps) {
  const [formData, setFormData] = useState({
    type: demande?.type || 'Accès',
    demandeur: demande?.demandeur || '',
    email: demande?.email || '',
    dateDemande: demande?.dateDemande || new Date().toISOString().split('T')[0],
    dateEcheance: demande?.dateEcheance || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    statut: demande?.statut || 'En attente',
    description: demande?.description || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Calculate days remaining
      const echeance = new Date(formData.dateEcheance);
      const today = new Date();
      const joursRestants = Math.ceil((echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      await onSave({ ...formData, joursRestants });
      onClose();
    } catch (error) {
      console.error('Error saving demande:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">
            {demande ? 'Modifier la demande' : 'Nouvelle demande d\'exercice de droits'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Type de demande <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="typeDemande" helpContent={demandeHelp.typeDemande} />
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Accès">Accès</option>
                <option value="Rectification">Rectification</option>
                <option value="Effacement">Effacement</option>
                <option value="Portabilité">Portabilité</option>
                <option value="Opposition">Opposition</option>
                <option value="Limitation">Limitation du traitement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Statut <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="statut" helpContent={demandeHelp.statut} />
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Traitée">Traitée</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Nom du demandeur <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="nomDemandeur" helpContent={demandeHelp.nomDemandeur} />
              </label>
              <input
                type="text"
                value={formData.demandeur}
                onChange={(e) => setFormData({ ...formData, demandeur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Email <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="emailDemandeur" helpContent={demandeHelp.emailDemandeur} />
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
                <span>Date de réception <span className="text-red-500">*</span></span>
                <FieldHelp fieldKey="dateReception" helpContent={demandeHelp.dateReception} />
              </label>
              <input
                type="date"
                value={formData.dateDemande}
                onChange={(e) => setFormData({ ...formData, dateDemande: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Date d'échéance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center justify-between">
              <span>Description <span className="text-red-500">*</span></span>
              <FieldHelp fieldKey="description" helpContent={demandeHelp.description} />
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
            />
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