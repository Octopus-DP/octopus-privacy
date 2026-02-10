/**
 * Simple in-memory cache for production optimization
 * Cache TTL (Time To Live) configurable par type de données
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private hits: number;
  private misses: number;

  constructor() {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    
    // Nettoyage automatique toutes les 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Récupérer une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Vérifier si l'entrée a expiré
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Stocker une valeur dans le cache
   * @param key - Clé unique
   * @param value - Valeur à stocker
   * @param ttl - Time to live en millisecondes (défaut: 5 minutes)
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalider une clé spécifique
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les clés commençant par un préfixe
   */
  invalidateByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Nettoyer les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total * 100).toFixed(2) : '0.00';
    
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
      total,
    };
  }

  /**
   * Réinitialiser les statistiques
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Vider complètement le cache
   */
  clear(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

// Instance singleton
export const cache = new CacheManager();

// TTL configurations (en millisecondes)
export const TTL = {
  CLIENT: 10 * 60 * 1000,      // 10 minutes - rarement modifié
  USER: 5 * 60 * 1000,          // 5 minutes - peut changer
  TRAITEMENT: 2 * 60 * 1000,    // 2 minutes - modifié fréquemment
  DEMANDE: 2 * 60 * 1000,       // 2 minutes - modifié fréquemment
  VIOLATION: 2 * 60 * 1000,     // 2 minutes - modifié fréquemment
  LEGAL_ENTITY: 10 * 60 * 1000, // 10 minutes - rarement modifié
  LIST: 1 * 60 * 1000,          // 1 minute - listes peuvent changer
};

/**
 * Helper pour générer des clés de cache cohérentes
 */
export const CacheKeys = {
  client: (id: string) => `client:${id}`,
  clientList: () => 'clients:list',
  user: (id: string) => `user:${id}`,
  userList: (clientId?: string) => clientId ? `users:list:${clientId}` : 'users:list',
  traitement: (clientId: string, id: string) => `traitement:${clientId}:${id}`,
  traitementList: (clientId: string, page: number) => `traitements:list:${clientId}:${page}`,
  demande: (clientId: string, id: string) => `demande:${clientId}:${id}`,
  demandeList: (clientId: string, page: number) => `demandes:list:${clientId}:${page}`,
  violation: (clientId: string, id: string) => `violation:${clientId}:${id}`,
  violationList: (clientId: string, page: number) => `violations:list:${clientId}:${page}`,
};
