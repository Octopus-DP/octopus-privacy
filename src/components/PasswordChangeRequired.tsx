import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { projectId } from '../utils/supabase/info';

interface PasswordChangeRequiredProps {
  accessToken: string;
  onPasswordChanged: () => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function PasswordChangeRequired({ accessToken, onPasswordChanged }: PasswordChangeRequiredProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  // Validation du mot de passe selon RGPD/CNIL/ANSSI
  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 12,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const validation = validatePassword(newPassword);
  const isPasswordValid = Object.values(validation).every(v => v);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        onPasswordChanged();
      } else {
        setError(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-600 rounded-lg p-3">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle>Changement de mot de passe requis</CardTitle>
          <CardDescription>
            Pour des raisons de sécurité, vous devez définir un nouveau mot de passe lors de votre première connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900">Critères de sécurité (conforme RGPD/CNIL) :</p>
              <div className="space-y-1 text-sm">
                <ValidationItem 
                  valid={validation.minLength} 
                  text="Au moins 12 caractères" 
                />
                <ValidationItem 
                  valid={validation.hasUpperCase} 
                  text="Au moins une majuscule (A-Z)" 
                />
                <ValidationItem 
                  valid={validation.hasLowerCase} 
                  text="Au moins une minuscule (a-z)" 
                />
                <ValidationItem 
                  valid={validation.hasNumber} 
                  text="Au moins un chiffre (0-9)" 
                />
                <ValidationItem 
                  valid={validation.hasSpecialChar} 
                  text="Au moins un caractère spécial (!@#$...)" 
                />
              </div>
            </div>

            {/* Match validation */}
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Les mots de passe correspondent</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Les mots de passe ne correspondent pas</span>
                  </>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !isPasswordValid || !passwordsMatch}
            >
              {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Recommandations de sécurité :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>N'utilisez pas d'informations personnelles</li>
                  <li>Ne réutilisez pas un ancien mot de passe</li>
                  <li>Conservez ce mot de passe en lieu sûr</li>
                  <li>Ne le partagez avec personne</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ValidationItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${valid ? 'text-green-600' : 'text-gray-500'}`}>
      {valid ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <span>{text}</span>
    </div>
  );
}
