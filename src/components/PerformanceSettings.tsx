import { useState, useEffect } from 'react';
import { Database, Archive, RefreshCw, Trash2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { projectId } from '../utils/supabase/info';

interface PerformanceSettingsProps {
  accessToken: string;
}

export function PerformanceSettings({ accessToken }: PerformanceSettingsProps) {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [archiveStats, setArchiveStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [archiveResults, setArchiveResults] = useState<any>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load cache stats
      const cacheResponse = await fetch(`${apiUrl}/admin/cache/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const cacheData = await cacheResponse.json();
      if (cacheData.success) {
        setCacheStats(cacheData.stats);
      }

      // Load archive stats
      const archiveResponse = await fetch(`${apiUrl}/admin/archive/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const archiveData = await archiveResponse.json();
      if (archiveData.success) {
        setArchiveStats(archiveData.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider le cache ? Cela peut ralentir temporairement les performances.')) {
      return;
    }

    try {
      setClearing(true);
      const response = await fetch(`${apiUrl}/admin/cache/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Cache vidé avec succès');
        await loadStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Erreur lors du vidage du cache');
    } finally {
      setClearing(false);
    }
  };

  const handleArchiveAll = async () => {
    if (!confirm('Archiver l\'historique ancien (> 2 ans) de tous les clients ?\n\nCette opération peut prendre plusieurs minutes.')) {
      return;
    }

    try {
      setArchiving(true);
      setArchiveResults(null);
      
      const response = await fetch(`${apiUrl}/admin/archive/all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setArchiveResults(data.results);
        await loadStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error archiving:', error);
      alert('Erreur lors de l\'archivage');
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Performance & Optimisation</h1>
        <p className="text-gray-600">
          Gestion du cache, archivage automatique et optimisation des performances
        </p>
      </div>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Cache Serveur
              </CardTitle>
              <CardDescription>Statistiques du cache en mémoire</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearCache}
              disabled={clearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {clearing ? 'Vidage...' : 'Vider le cache'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cacheStats ? (
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Taille du cache</div>
                <div className="text-2xl text-blue-900">{cacheStats.size}</div>
                <div className="text-xs text-blue-600">entrées</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Hits</div>
                <div className="text-2xl text-green-900">{cacheStats.hits}</div>
                <div className="text-xs text-green-600">requêtes servies</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 mb-1">Misses</div>
                <div className="text-2xl text-orange-900">{cacheStats.misses}</div>
                <div className="text-xs text-orange-600">requêtes manquées</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 mb-1">Taux de succès</div>
                <div className="text-2xl text-purple-900">{cacheStats.hitRate}</div>
                <div className="text-xs text-purple-600">hit rate</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Aucune statistique disponible</p>
          )}
          
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="mb-2"><strong>Comment fonctionne le cache :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Les données fréquemment accédées sont stockées en mémoire</li>
                  <li>TTL (Time To Live) : 1-10 minutes selon le type de donnée</li>
                  <li>Invalidation automatique lors des modifications</li>
                  <li>Nettoyage automatique des entrées expirées toutes les 5 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archive System */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-purple-600" />
                Archivage Automatique
              </CardTitle>
              <CardDescription>Archivage de l'historique ancien dans Supabase Storage</CardDescription>
            </div>
            <Button 
              onClick={handleArchiveAll}
              disabled={archiving}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${archiving ? 'animate-spin' : ''}`} />
              {archiving ? 'Archivage...' : 'Archiver maintenant'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {archiveStats && !archiveStats.error ? (
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 mb-1">Fichiers archivés</div>
                <div className="text-2xl text-purple-900">{archiveStats.fileCount}</div>
                <div className="text-xs text-purple-600">fichiers</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="text-sm text-indigo-600 mb-1">Espace utilisé</div>
                <div className="text-2xl text-indigo-900">{archiveStats.totalSizeMB}</div>
                <div className="text-xs text-indigo-600">MB</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Espace total</div>
                <div className="text-2xl text-blue-900">{archiveStats.totalSizeBytes.toLocaleString()}</div>
                <div className="text-xs text-blue-600">octets</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center text-gray-600">
              Aucune archive créée pour le moment
            </div>
          )}

          {archiveResults && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-900 mb-3">
                    <strong>Archivage terminé avec succès</strong>
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-green-700">Traitements</div>
                      <div className="text-green-900">
                        {archiveResults.modules.traitement.archived} archivés
                        {archiveResults.modules.traitement.errors > 0 && ` (${archiveResults.modules.traitement.errors} erreurs)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-green-700">Demandes</div>
                      <div className="text-green-900">
                        {archiveResults.modules.demande.archived} archivés
                        {archiveResults.modules.demande.errors > 0 && ` (${archiveResults.modules.demande.errors} erreurs)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-green-700">Violations</div>
                      <div className="text-green-900">
                        {archiveResults.modules.violation.archived} archivés
                        {archiveResults.modules.violation.errors > 0 && ` (${archiveResults.modules.violation.errors} erreurs)`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200 text-green-900">
                    <strong>Total :</strong> {archiveResults.totalArchived} entrées archivées
                    {archiveResults.totalErrors > 0 && ` • ${archiveResults.totalErrors} erreurs`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="mb-2"><strong>Politique d'archivage :</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>L'historique de plus de <strong>2 ans</strong> est automatiquement archivé</li>
                  <li>Les archives sont stockées dans Supabase Storage (bucket privé)</li>
                  <li>Structure : <code className="bg-gray-200 px-1 rounded">module/clientId/année/history.json</code></li>
                  <li>Les entrées archivées sont supprimées du KV store pour optimiser les performances</li>
                  <li>Les archives restent accessibles via l'API pour consultation</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Recommandations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Cache :</strong> Vider uniquement en cas de problème (données obsolètes affichées)</p>
          <p>• <strong>Archivage :</strong> Lancer manuellement 1 fois par an ou programmer une tâche CRON</p>
          <p>• <strong>Performance :</strong> Surveiller le taux de succès du cache (objectif &gt; 70%)</p>
          <p>• <strong>Espace disque :</strong> Les archives comptent dans le quota Supabase Storage (8GB sur tier Pro)</p>
        </CardContent>
      </Card>
    </div>
  );
}