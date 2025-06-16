const axios = require('axios');
const {loggerInstance} = require('../middleware/logger');

class PlausibleService {
  constructor() {
    this.baseURL = process.env.PLAUSIBLE_BASE_URL || 'https://plausible.io';
    this.apiVersion = process.env.PLAUSIBLE_API_VERSION || 'v2';
    this.timeout = 10000; // 10 secondes
  }
  
  /**
   * Créer une instance axios configurée
   */
  createAxiosInstance(apiKey) {
    return axios.create({
      baseURL: `${this.baseURL}/api`,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PlausibleAPI-NodeJS/1.0'
      }
    });
  }
  
  /**
   * Gérer les erreurs Plausible
   */
  handlePlausibleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          throw new Error('Clé API invalide ou non autorisée');
        case 402:
          throw new Error('Limite de requêtes dépassée pour votre plan');
        case 404:
          throw new Error('Site non trouvé ou non accessible');
        case 422:
          throw new Error('Paramètres de requête invalides');
        case 429:
          throw new Error('Trop de requêtes - limite de taux dépassée');
        default:
          throw new Error(data?.error || `Erreur API Plausible: ${status}`);
      }
    } else if (error.request) {
      throw new Error('Impossible de joindre l\'API Plausible');
    } else {
      throw new Error(`Erreur de configuration: ${error.message}`);
    }
  }
  
  /**
   * Obtenir les visiteurs en temps réel
   */
  async getRealtime(apiKey, siteId) {
    try {
      const client = this.createAxiosInstance(apiKey);
      
      const response = await client.get(`/v1/stats/realtime/visitors`, {
        params: { site_id: siteId }
      });
      
      loggerInstance.info(`Realtime data retrieved for ${siteId}: ${response.data} visitors`);
      
      return {
        visitors: response.data,
        site_id: siteId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      loggerInstance.error(`Erreur getRealtime pour ${siteId}:`, error.message);
      this.handlePlausibleError(error);
    }
  }
  
/**
 * Obtenir les données de série temporelle avec l'API v2
 */
async getTimeseries(apiKey, params) {
  try {
    const client = this.createAxiosInstance(apiKey);

    // Construction dynamique du body sans interval si non fourni explicitement
    const queryBody = {
      site_id: params.site_id,
      metrics: params.metrics,
      date_range: params.period
    };
    if (typeof params.interval !== 'undefined' && params.interval !== null && params.interval !== '') {
      queryBody.interval = params.interval;
    }

    const response = await client.post(`/${this.apiVersion}/query`, queryBody);

    loggerInstance.info(`Timeseries data retrieved for ${params.site_id}`);

    return {
      results: response.data.results,
      query: queryBody,
      meta: response.data.meta
    };

  } catch (error) {
    loggerInstance.error(`Erreur getTimeseries pour ${params.site_id}:`, error.message);
    this.handlePlausibleError(error);
  }
}
  
  /**
   * Obtenir les données de répartition avec l'API v2
   */
async getBreakdown(apiKey, params) {
  try {
    const client = this.createAxiosInstance(apiKey);

    // Construction dynamique du body
    const queryBody = {
      site_id: params.site_id,
      property: params.property,
      metrics: params.metrics,
      date_range: params.period
    };
    // N’ajoute limit que si c’est explicitement supporté par l’API Plausible
    if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
      queryBody.limit = params.limit;
    }

    const response = await client.post(`/${this.apiVersion}/breakdown`, queryBody);

    loggerInstance.info(`Breakdown data retrieved for ${params.site_id}`);

    return {
      results: response.data.results,
      query: queryBody,
      meta: response.data.meta
    };

  } catch (error) {
    loggerInstance.error(`Erreur getBreakdown pour ${params.site_id}:`, error.message);
    this.handlePlausibleError(error);
  }
}
  
  /**
   * Obtenir les métriques agrégées avec l'API v2
   */
  async getAggregate(apiKey, params) {
    try {
      const client = this.createAxiosInstance(apiKey);
      
      const queryBody = {
        site_id: params.site_id,
        metrics: params.metrics,
        date_range: params.period
      };
      
      const response = await client.post(`/${this.apiVersion}/query`, queryBody);
      
      loggerInstance.info(`Aggregate data retrieved for ${params.site_id}`);
      
      return {
        results: response.data.results,
        query: queryBody,
        meta: response.data.meta
      };
      
    } catch (error) {
      loggerInstance.error(`Erreur getAggregate pour ${params.site_id}:`, error.message);
      this.handlePlausibleError(error);
    }
  }
  
  /**
   * Tester la connexion à l'API
   */
  async testConnection(apiKey, siteId) {
    try {
      const client = this.createAxiosInstance(apiKey);
      
      // Test simple avec les visiteurs en temps réel
      await client.get(`/v1/stats/realtime/visitors`, {
        params: { site_id: siteId }
      });
      
      loggerInstance.info(`Test de connexion réussi pour ${siteId}`);
      return true;
      
    } catch (error) {
      loggerInstance.error(`Test de connexion échoué pour ${siteId}:`, error.message);
      return false;
    }
  }
}

module.exports = new PlausibleService();