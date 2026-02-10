import { useState } from 'react';
import { Check, ArrowRight, Shield, Users, Building2, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface GuideOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
}

export function GuideOverlay({ isOpen, onClose, adminEmail }: GuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🎉 Configuration initiale terminée !",
      icon: Check,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      content: (
        <div className="space-y-4">
          <p>Votre email administrateur a été configuré avec succès :</p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="font-mono text-blue-900">{adminEmail}</p>
          </div>
          <p>Suivez maintenant les étapes suivantes pour créer votre compte et commencer à utiliser l'application.</p>
        </div>
      ),
    },
    {
      title: "Étape 1 : Créer votre compte Supabase",
      icon: Shield,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      content: (
        <div className="space-y-4">
          <p>Vous devez créer votre compte utilisateur dans Supabase :</p>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>Ouvrez un nouvel onglet et connectez-vous à <strong>Supabase</strong></li>
            <li>Sélectionnez votre projet Octopus Data & Privacy</li>
            <li>Dans le menu de gauche, cliquez sur <strong>Authentication</strong></li>
            <li>Cliquez sur l'onglet <strong>Users</strong></li>
            <li>Cliquez sur le bouton <strong>"Add user"</strong> en haut à droite</li>
            <li>Sélectionnez <strong>"Create new user"</strong></li>
          </ol>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-900">
              💡 <strong>Astuce :</strong> Gardez cet onglet ouvert, vous en aurez besoin !
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Étape 2 : Remplir les informations",
      icon: Settings,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      content: (
        <div className="space-y-4">
          <p>Dans le formulaire de création d'utilisateur Supabase :</p>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-medium mb-1">Email</p>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border">{adminEmail}</p>
              <p className="text-xs text-gray-500 mt-1">⚠️ Utilisez EXACTEMENT cet email</p>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-medium mb-1">Password</p>
              <p className="text-sm text-gray-600">Choisissez un mot de passe sécurisé (minimum 6 caractères)</p>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-medium mb-1">Auto Confirm User</p>
              <p className="text-sm text-gray-600">✅ Cochez cette case</p>
            </div>
          </div>
          <p className="text-sm">Puis cliquez sur <strong>"Create user"</strong></p>
        </div>
      ),
    },
    {
      title: "Étape 3 : Se connecter",
      icon: Shield,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      content: (
        <div className="space-y-4">
          <p>Votre compte est maintenant créé ! Vous pouvez vous connecter :</p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-sm font-medium">Email :</p>
              <p className="font-mono text-sm">{adminEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Mot de passe :</p>
              <p className="text-sm">Le mot de passe que vous venez de créer</p>
            </div>
          </div>
          <p>Fermez ce guide et cliquez sur "Se connecter" sur la page de connexion.</p>
        </div>
      ),
    },
    {
      title: "Étape 4 : Créer vos clients",
      icon: Building2,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      content: (
        <div className="space-y-4">
          <p>Une fois connecté à l'espace administrateur :</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Vous verrez un tableau de bord avec deux onglets : <strong>Clients</strong> et <strong>Utilisateurs</strong></li>
            <li>Dans l'onglet <strong>Clients</strong>, cliquez sur <strong>"Nouveau client"</strong></li>
            <li>Remplissez les informations de votre client (entreprise) :
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Nom de l'entreprise</li>
                <li>Email de contact</li>
                <li>Téléphone (optionnel)</li>
                <li>Adresse (optionnel)</li>
              </ul>
            </li>
            <li>Cliquez sur <strong>"Créer le client"</strong></li>
          </ol>
        </div>
      ),
    },
    {
      title: "Étape 5 : Créer des utilisateurs",
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      content: (
        <div className="space-y-4">
          <p>Pour chaque client, créez des utilisateurs qui auront accès au portail :</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Allez dans l'onglet <strong>Utilisateurs</strong></li>
            <li>Cliquez sur <strong>"Nouvel utilisateur"</strong></li>
            <li>Remplissez les informations :
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Sélectionnez le client</li>
                <li>Nom complet de l'utilisateur</li>
                <li>Email</li>
                <li>Mot de passe</li>
              </ul>
            </li>
            <li>Définissez les <strong>permissions</strong> (accès aux fonctionnalités) :
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>✅ Registre des traitements (Article 30 RGPD)</li>
                <li>✅ Exercice des droits (Articles 15-22 RGPD)</li>
                <li>✅ Violations de données (Article 33 RGPD)</li>
              </ul>
            </li>
            <li>Cliquez sur <strong>"Créer l'utilisateur"</strong></li>
          </ol>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              ✅ L'utilisateur pourra maintenant se connecter avec son email et mot de passe !
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "🎊 Tout est prêt !",
      icon: Check,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      content: (
        <div className="space-y-4">
          <p>Félicitations ! Votre portail client RGPD est maintenant opérationnel.</p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="font-medium mb-2">Récapitulatif :</p>
            <ul className="space-y-2 text-sm">
              <li>✅ Compte administrateur créé</li>
              <li>✅ Vous pouvez gérer vos clients</li>
              <li>✅ Vous pouvez créer des utilisateurs avec permissions</li>
              <li>✅ Vos clients peuvent se connecter au portail</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            Vous pouvez à tout moment modifier les clients, utilisateurs et leurs permissions depuis votre espace administrateur.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`${currentStepData.iconBg} rounded-lg p-2`}>
              <Icon className={`h-6 w-6 ${currentStepData.iconColor}`} />
            </div>
            <div className="flex-1">
              <DialogTitle>{currentStepData.title}</DialogTitle>
              <DialogDescription>
                Étape {currentStep + 1} sur {steps.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentStepData.content}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious} className="flex-1">
              Précédent
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {currentStep < steps.length - 1 ? (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Terminer
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
