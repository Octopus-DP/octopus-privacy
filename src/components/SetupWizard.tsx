import { useState } from 'react';
import { Shield, User, Check, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { GuideOverlay } from './GuideOverlay';
import { projectId } from '../utils/supabase/info';
import { publicAnonKey } from '../utils/supabase/info';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);

    try {
      console.log('Initializing admin with email:', email);
      console.log('API URL:', apiUrl);
      
      // Initialize admin in database
      const initResponse = await fetch(`${apiUrl}/init-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      console.log('Init response status:', initResponse.status);
      const initData = await initResponse.json();
      console.log('Init response data:', initData);

      if (!initData.success) {
        const errorMsg = initData.details || initData.error || 'Erreur lors de l\'initialisation';
        console.error('Initialization failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // Show guide overlay
      console.log('Admin initialized successfully, showing guide');
      setAdminEmail(email);
      setShowGuide(true);

    } catch (error: any) {
      console.error('Setup error:', error);
      const errorMessage = error?.message || 'Erreur lors de la configuration';
      setError(errorMessage);
      
      // Log more details for debugging
      console.error('Full error details:', {
        message: error?.message,
        stack: error?.stack,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuideClose = () => {
    setShowGuide(false);
    onComplete();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 rounded-lg p-3">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle>Bienvenue sur Octopus Data & Privacy</CardTitle>
            <CardDescription>
              Configuration initiale de votre portail client RGPD
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email administrateur *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Cet email sera utilisé pour vous connecter en tant qu'administrateur
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">📋 Ce que vous allez pouvoir faire :</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Créer et gérer vos clients</li>
                  <li>✅ Créer des utilisateurs pour chaque client</li>
                  <li>✅ Définir les permissions par fonctionnalité RGPD</li>
                  <li>✅ Gérer le Registre, les Droits et les Violations</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Configuration...' : 'Commencer la configuration'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Important :</strong> Cette configuration ne peut être effectuée qu'une seule fois. 
                Un guide détaillé vous accompagnera ensuite pour créer votre compte et vos premiers clients.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <GuideOverlay 
        isOpen={showGuide} 
        onClose={handleGuideClose}
        adminEmail={adminEmail}
      />
    </>
  );
}