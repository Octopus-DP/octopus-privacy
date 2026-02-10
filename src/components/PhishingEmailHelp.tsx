import { HelpCircle, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function PhishingEmailHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Aide : Emails non reçus ?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Dépannage : Les emails ne sont pas reçus
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Instructions principales */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Étape 1 : Ouvrir la console du navigateur</strong>
                </p>
                <p className="text-xs text-blue-800 mb-2">
                  Appuyez sur <kbd className="px-2 py-1 bg-white rounded border text-xs">F12</kbd> ou clic droit → "Inspecter" → Onglet "Console"
                </p>
                <p className="text-xs text-blue-800">
                  Les logs détaillés vous indiqueront exactement où se situe le problème.
                </p>
              </div>
            </div>
          </div>

          {/* Problèmes fréquents */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Problèmes fréquents :</h3>

            {/* Problème 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <strong>Aucun destinataire</strong>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Log: <code className="bg-gray-100 px-1 rounded">[PHISHING] Found 0 recipients</code>
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Solution :</strong>
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Vérifiez d'avoir ajouté des destinataires à l'étape 3 du wizard</li>
                  <li>Les emails doivent être valides</li>
                  <li>Essayez de créer une nouvelle campagne</li>
                </ul>
              </div>
            </div>

            {/* Problème 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <strong>Identifiants Mailjet manquants</strong>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Log: <code className="bg-gray-100 px-1 rounded">Mailjet credentials - API Key: false</code>
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Solution :</strong>
                </p>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Aller sur <a href="https://www.mailjet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Mailjet.com</a></li>
                  <li>Créer un compte gratuit (6000 emails/mois)</li>
                  <li>Account Settings → REST API → Copier les clés</li>
                  <li>Configurer dans Supabase Dashboard → Secrets</li>
                </ol>
              </div>
            </div>

            {/* Problème 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <strong>Email expéditeur contient des variables</strong>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Log: <code className="bg-gray-100 px-1 rounded">it-security@{`{{company_domain}}`}" is an invalid email</code>
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Solution :</strong>
                </p>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Éditer le template de phishing</li>
                  <li>Dans "Email expéditeur", remplacer <code className="bg-gray-100 px-1 rounded">it-security@{`{{company_domain}}`}</code></li>
                  <li>Par un email réel et vérifié : <code className="bg-gray-100 px-1 rounded">noreply@votredomaine.com</code></li>
                  <li>Vérifier cet email dans Mailjet (Account Settings → Sender Addresses)</li>
                </ol>
              </div>
            </div>

            {/* Problème 4 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <strong>Email expéditeur non vérifié</strong>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Log: <code className="bg-gray-100 px-1 rounded">Sender email address is not verified</code>
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Solution :</strong>
                </p>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Aller sur Mailjet → Account Settings → Sender Addresses</li>
                  <li>Ajouter et vérifier l'email utilisé dans votre template</li>
                  <li>Confirmer via le lien envoyé par email</li>
                </ol>
              </div>
            </div>

            {/* Problème 5 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <strong>Email envoyé mais pas reçu</strong>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Log: <code className="bg-gray-100 px-1 rounded">[MAILJET] ✅ Email sent successfully!</code>
                  </p>
                </div>
              </div>
              <div className="ml-8">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Solutions :</strong>
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Vérifier le dossier <strong>Spam/Courrier indésirable</strong></li>
                  <li>Aller sur <a href="https://app.mailjet.com/stats" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Mailjet Stats</a> pour voir le statut de livraison</li>
                  <li>Essayer avec un email personnel (Gmail, Outlook)</li>
                  <li>Le firewall d'entreprise peut bloquer les emails de test</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm text-gray-900 mb-3">
              <strong>✅ Checklist avant de lancer :</strong>
            </h3>
            <div className="space-y-2 text-xs text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Secrets Mailjet configurés dans Supabase
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Email expéditeur vérifié dans Mailjet
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Destinataires ajoutés avec emails valides
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Console ouverte (F12) pour voir les logs
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Mode envoi = "Immédiat"
              </label>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm text-gray-900 mb-3">
              <strong>🔗 Liens utiles :</strong>
            </h3>
            <div className="space-y-2 text-xs">
              <a 
                href="https://www.mailjet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                → Créer un compte Mailjet
              </a>
              <a 
                href="https://app.mailjet.com/account/sender" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                → Vérifier un email expéditeur
              </a>
              <a 
                href="https://app.mailjet.com/stats" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                → Voir les statistiques d'envoi Mailjet
              </a>
            </div>
          </div>

          {/* Test rapide */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-900 mb-2">
                  <strong>Test rapide recommandé :</strong>
                </p>
                <ol className="text-xs text-green-800 space-y-1 list-decimal list-inside">
                  <li>Créez une campagne avec VOTRE email personnel comme seul destinataire</li>
                  <li>Utilisez un template avec un email expéditeur vérifié</li>
                  <li>Ouvrez la console (F12) avant de lancer</li>
                  <li>Lancez et observez les logs</li>
                  <li>Vérifiez votre boîte mail (et spam)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
