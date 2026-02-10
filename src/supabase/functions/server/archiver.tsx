import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

/**
 * Système d'archivage automatique de l'historique ancien
 * Archive l'historique > 2 ans dans Supabase Storage
 */

const ARCHIVE_BUCKET = 'make-abb8d15d-archives';
const ARCHIVE_THRESHOLD_YEARS = 2;

const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * Initialiser le bucket d'archives (appelé au démarrage du serveur)
 */
export async function initializeArchiveBucket(): Promise<void> {
  try {
    const supabase = getServiceClient();
    
    // Vérifier si le bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === ARCHIVE_BUCKET);
    
    if (!bucketExists) {
      console.log(`Creating archive bucket: ${ARCHIVE_BUCKET}`);
      const { error } = await supabase.storage.createBucket(ARCHIVE_BUCKET, {
        public: false,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB max par fichier
      });
      
      if (error) {
        console.error('Error creating archive bucket:', error);
      } else {
        console.log('Archive bucket created successfully');
      }
    } else {
      console.log('Archive bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing archive bucket:', error);
  }
}

/**
 * Archiver l'historique ancien d'un module spécifique
 */
export async function archiveOldHistory(
  module: 'traitement' | 'demande' | 'violation',
  clientId: string
): Promise<{ archived: number; errors: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - ARCHIVE_THRESHOLD_YEARS);
    
    console.log(`Archiving ${module} history for client ${clientId} older than ${cutoffDate.toISOString()}`);
    
    // Récupérer tout l'historique du module pour ce client
    const historyPrefix = `${module}_history:${clientId}:`;
    const allHistory = await kv.getByPrefix(historyPrefix);
    
    // Filtrer les entrées > 2 ans
    const oldEntries = allHistory.filter((entry: any) => {
      const timestamp = entry.timestamp || extractTimestampFromKey(entry.key);
      return new Date(timestamp) < cutoffDate;
    });
    
    if (oldEntries.length === 0) {
      console.log(`No old history to archive for ${module}:${clientId}`);
      return { archived: 0, errors: 0 };
    }
    
    // Grouper par année
    const entriesByYear = groupByYear(oldEntries);
    
    let archived = 0;
    let errors = 0;
    
    // Sauvegarder chaque année dans un fichier séparé
    for (const [year, entries] of Object.entries(entriesByYear)) {
      try {
        const filename = `${module}/${clientId}/${year}/history.json`;
        
        const supabase = getServiceClient();
        const { error } = await supabase.storage
          .from(ARCHIVE_BUCKET)
          .upload(filename, JSON.stringify(entries, null, 2), {
            contentType: 'application/json',
            upsert: true, // Écraser si existe déjà
          });
        
        if (error) {
          console.error(`Error archiving ${year}:`, error);
          errors++;
        } else {
          console.log(`Archived ${entries.length} entries for year ${year}`);
          
          // Supprimer du KV store après archivage réussi
          const keysToDelete = entries.map((e: any) => e.key);
          await kv.mdel(keysToDelete);
          
          archived += entries.length;
        }
      } catch (err) {
        console.error(`Error processing year ${year}:`, err);
        errors++;
      }
    }
    
    console.log(`Archive complete for ${module}:${clientId} - Archived: ${archived}, Errors: ${errors}`);
    return { archived, errors };
    
  } catch (error) {
    console.error('Error in archiveOldHistory:', error);
    return { archived: 0, errors: 1 };
  }
}

/**
 * Archiver l'historique de tous les clients
 */
export async function archiveAllHistory(): Promise<any> {
  console.log('Starting global history archiving...');
  
  const results: any = {
    timestamp: new Date().toISOString(),
    modules: {
      traitement: { archived: 0, errors: 0 },
      demande: { archived: 0, errors: 0 },
      violation: { archived: 0, errors: 0 },
    },
    totalArchived: 0,
    totalErrors: 0,
  };
  
  try {
    // Récupérer tous les clients
    const clients = await kv.getByPrefix('client:');
    console.log(`Found ${clients.length} clients to process`);
    
    for (const client of clients) {
      const clientId = client.id;
      
      // Archiver chaque module
      for (const module of ['traitement', 'demande', 'violation'] as const) {
        const result = await archiveOldHistory(module, clientId);
        results.modules[module].archived += result.archived;
        results.modules[module].errors += result.errors;
      }
    }
    
    results.totalArchived = 
      results.modules.traitement.archived +
      results.modules.demande.archived +
      results.modules.violation.archived;
    
    results.totalErrors =
      results.modules.traitement.errors +
      results.modules.demande.errors +
      results.modules.violation.errors;
    
    console.log('Global archiving complete:', results);
    return results;
    
  } catch (error) {
    console.error('Error in archiveAllHistory:', error);
    results.error = String(error);
    return results;
  }
}

/**
 * Récupérer l'historique archivé depuis Storage
 */
export async function getArchivedHistory(
  module: 'traitement' | 'demande' | 'violation',
  clientId: string,
  year: number
): Promise<any[]> {
  try {
    const supabase = getServiceClient();
    const filename = `${module}/${clientId}/${year}/history.json`;
    
    const { data, error } = await supabase.storage
      .from(ARCHIVE_BUCKET)
      .download(filename);
    
    if (error) {
      console.error('Error downloading archive:', error);
      return [];
    }
    
    const text = await data.text();
    return JSON.parse(text);
    
  } catch (error) {
    console.error('Error getting archived history:', error);
    return [];
  }
}

/**
 * Lister les années archivées disponibles pour un client/module
 */
export async function listArchivedYears(
  module: 'traitement' | 'demande' | 'violation',
  clientId: string
): Promise<number[]> {
  try {
    const supabase = getServiceClient();
    const prefix = `${module}/${clientId}/`;
    
    const { data, error } = await supabase.storage
      .from(ARCHIVE_BUCKET)
      .list(prefix);
    
    if (error) {
      console.error('Error listing archives:', error);
      return [];
    }
    
    // Extraire les années des noms de dossiers
    const years = data
      .filter((item: any) => item.name && !isNaN(parseInt(item.name)))
      .map((item: any) => parseInt(item.name))
      .sort((a, b) => b - a); // Plus récent en premier
    
    return years;
    
  } catch (error) {
    console.error('Error listing archived years:', error);
    return [];
  }
}

// === Helpers ===

/**
 * Extraire le timestamp d'une clé KV
 */
function extractTimestampFromKey(key: string): string {
  // Format: module_history:clientId:itemId:timestamp
  const parts = key.split(':');
  const timestamp = parts[parts.length - 1];
  return timestamp;
}

/**
 * Grouper les entrées par année
 */
function groupByYear(entries: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  for (const entry of entries) {
    const timestamp = entry.timestamp || extractTimestampFromKey(entry.key);
    const year = new Date(timestamp).getFullYear().toString();
    
    if (!grouped[year]) {
      grouped[year] = [];
    }
    
    grouped[year].push(entry);
  }
  
  return grouped;
}

/**
 * Obtenir les statistiques d'archivage
 */
export async function getArchiveStats(): Promise<any> {
  try {
    const supabase = getServiceClient();
    
    const { data, error } = await supabase.storage
      .from(ARCHIVE_BUCKET)
      .list();
    
    if (error) {
      return { error: error.message };
    }
    
    let totalSize = 0;
    let fileCount = 0;
    
    // Parcourir récursivement pour compter les fichiers
    const countFiles = async (path: string = '') => {
      const { data: items } = await supabase.storage
        .from(ARCHIVE_BUCKET)
        .list(path);
      
      for (const item of items || []) {
        if (item.metadata) {
          totalSize += item.metadata.size || 0;
          fileCount++;
        }
      }
    };
    
    await countFiles();
    
    return {
      fileCount,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    };
    
  } catch (error) {
    console.error('Error getting archive stats:', error);
    return { error: String(error) };
  }
}
