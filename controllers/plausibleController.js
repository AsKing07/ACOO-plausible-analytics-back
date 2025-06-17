const plausibleService = require('../services/plausibleService');
const cache = require('../utils/cache');
const {loggerInstance: logger} = require('../middleware/logger');

class PlausibleController {
  /**
   * Obtenir le nombre de visiteurs en temps réel
   */
  async getRealtime(req, res, next) {
    try {
      const { site_id } = req.query;
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      
      // Vérifier le cache
      const cacheKey = `realtime:${site_id}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache hit pour realtime: ${site_id}`);
        return res.json(cachedData);
      }
      
      // Appeler le service Plausible
      const data = await plausibleService.getRealtime(apiKey, site_id);
      
      // Mettre en cache pour 30 secondes
      cache.set(cacheKey, data, 30);
      
      res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Obtenir les données de série temporelle
   */
async getTimeseries(req, res, next) {
  try {
    const { site_id, period = '7d', metrics = 'visitors', dimensions=['time:day'] } = req.query;
    const apiKey = req.headers.authorization?.replace('Bearer ', '');

    const cacheKey = `timeseries:${site_id}:${period}:${metrics}:${dimensions || 'none'}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      logger.info(`Cache hit pour timeseries: ${site_id}`);
      return res.json(cachedData);
    }

    // Prépare les params - plus propre
    const params = {
      site_id,
      period,
      metrics: metrics.split(','),
      ...(dimensions && { dimensions })// Spread conditionnel
    };

    const data = await plausibleService.getTimeseries(apiKey, params);
    cache.set(cacheKey, data, 300);

    res.json({
      success: true,
      data: data,
      params: { site_id, period, metrics, ...(dimensions && { dimensions }) },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
}

  
  /**
   * Obtenir les données de répartition
   */
  async getBreakdown(req, res, next) {
    try {if (typeof req.query.dimensions === 'string') {
  req.query.dimensions = [req.query.dimensions];
}
     
      const { site_id, period = '7d', metrics = 'visitors',  dimensions=['visit:country'] } = req.query;
      
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      
      const cacheKey = `breakdown:${site_id}:${dimensions}:${period}:${metrics}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache hit pour breakdown: ${site_id}:${dimensions}`);
        return res.json(cachedData);
      }
      
      const data = await plausibleService.getBreakdown(apiKey, {
        site_id,
 
        period,
        metrics: metrics.split(','),
        dimensions: Array.isArray(dimensions) ? dimensions : [dimensions]

      });
      
      // Cache pour 10 minutes
      cache.set(cacheKey, data, 600);
      
      res.json({
        success: true,
        data: data,
        params: { site_id, dimensions, period, metrics},
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Obtenir les métriques agrégées
   */
  async getAggregate(req, res, next) {
    try {
      const { site_id, period = '7d', metrics = 'visitors,pageviews,bounce_rate,visit_duration' } = req.query;
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      
      const cacheKey = `aggregate:${site_id}:${period}:${metrics}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache hit pour aggregate: ${site_id}`);
        return res.json(cachedData);
      }
      
      const data = await plausibleService.getAggregate(apiKey, {
        site_id,
        period,
        metrics: metrics.split(',')
      });
      
      // Cache pour 5 minutes
      cache.set(cacheKey, data, 300);
      
      res.json({
        success: true,
        data: data,
        params: { site_id, period, metrics },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Tester la connexion à l'API Plausible
   */
  async testConnection(req, res, next) {
    try {
      const { api_key, site_id } = req.body;
      
      const isValid = await plausibleService.testConnection(api_key, site_id);
      
      if (isValid) {
        res.json({
          success: true,
          message: 'Connexion réussie à l\'API Plausible',
          site_id: site_id
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Échec de la connexion',
          message: 'Clé API ou site ID invalide'
        });
      }
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlausibleController();

