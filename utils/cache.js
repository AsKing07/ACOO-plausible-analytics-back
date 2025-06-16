
const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes par défaut
      checkperiod: 60, // Vérifier les expirations toutes les 60 secondes
      useClones: false
    });
    
    // Événements de cache
    this.cache.on('set', (key, value) => {
      console.log(`Cache SET: ${key}`);
    });
    
    this.cache.on('del', (key, value) => {
      console.log(`Cache DEL: ${key}`);
    });
    
    this.cache.on('expired', (key, value) => {
      console.log(`Cache EXPIRED: ${key}`);
    });
  }
  
  /**
   * Obtenir une valeur du cache
   */
  get(key) {
    return this.cache.get(key);
  }
  
  /**
   * Définir une valeur dans le cache
   */
  set(key, value, ttl = null) {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }
  
  /**
   * Supprimer une clé du cache
   */
  del(key) {
    return this.cache.del(key);
  }
  
  /**
   * Vider tout le cache
   */
  flush() {
    return this.cache.flushAll();
  }
  
  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    return this.cache.getStats();
  }
  
  /**
   * Obtenir toutes les clés
   */
  keys() {
    return this.cache.keys();
  }
}

module.exports = new CacheManager();
