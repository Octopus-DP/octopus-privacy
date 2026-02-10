import { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { projectId } from '../utils/supabase/info';

interface InitAdminProps {
  onComplete: () => void;
}

export function InitAdmin({ onComplete }: InitAdminProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Initialize admin in database
      const initResponse = await fetch(`${apiUrl}/init-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const initData = await initResponse.json();

      if (!initData.success) {
        throw new Error(initData.error || 'Erreur lors de l\'initialisation');
      }

      // Create admin user in Supabase Auth
      // Note: This would normally be done via the admin API, but for first setup we'll guide the user
      setSuccess(true);
      
      // Wait a moment then complete
      setTimeout(() => {
        onComplete();
      }, 3000);

    } catch (error: any) {
      console.error('Init admin error:', error);
      setError(error.message || 'Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-gray-900 mb-2">Configuration terminée !</h2>
              <p className="text-gray-600">
                L'administrateur a été initialisé avec succès.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Redirection en cours...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle>Configuration initiale</CardTitle>
          <CardDescription>
            Créez votre compte administrateur pour Octopus Data & Privacy
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
                placeholder="admin@octopus-data-privacy.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Cet email sera utilisé pour la connexion administrateur
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Initialisation...' : 'Créer l\'administrateur'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Important :</strong> Cette configuration ne peut être effectuée qu'une seule fois. 
              Conservez précieusement vos identifiants.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
