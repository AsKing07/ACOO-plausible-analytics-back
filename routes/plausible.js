const express = require('express');
const router = express.Router();
const plausibleController = require('../controllers/plausibleController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { plausibleSchemas } = require('../validators/plausibleSchemas');

// Middleware d'authentification pour toutes les routes
router.use(auth.validateApiKey);

/**
 * @route   GET /api/plausible/realtime
 * @desc    Obtenir le nombre de visiteurs en temps réel
 * @query   site_id (string, requis)
 * @header  Authorization: Bearer <API_KEY>
 */
router.get('/realtime', 
  validate(plausibleSchemas.realtime), 
  plausibleController.getRealtime
);

/**
 * @route   GET /api/plausible/timeseries
 * @desc    Obtenir les données de série temporelle
 * @query   site_id (string, requis), period (string), metrics (string), interval (string), date (string, si period=custom)
 * @header  Authorization: Bearer <API_KEY>
 */
router.get('/timeseries', 
  validate(plausibleSchemas.timeseries), 
  plausibleController.getTimeseries
);

/**
 * @route   GET /api/plausible/breakdown/:property
 * @desc    Obtenir les données de répartition par propriété
 * @param   property (string, requis dans l'URL)
 * @query   site_id (string, requis), period (string), metrics (string), limit (number)
 * @header  Authorization: Bearer <API_KEY>
 */
router.get('/breakdown/:property', 
  validate(plausibleSchemas.breakdown), 
  plausibleController.getBreakdown
);

/**
 * @route   GET /api/plausible/aggregate
 * @desc    Obtenir les métriques agrégées
 * @query   site_id (string, requis), period (string), metrics (string), compare (boolean), filters (string)
 * @header  Authorization: Bearer <API_KEY>
 */
router.get('/aggregate', 
  validate(plausibleSchemas.aggregate), 
  plausibleController.getAggregate
);

/**
 * @route   POST /api/plausible/test-connection
 * @desc    Tester la connexion à l'API Plausible
 * @body    api_key (string, requis), site_id (string, requis)
 */
router.post('/test-connection', 
  validate(plausibleSchemas.testConnection), 
  plausibleController.testConnection
);

module.exports = router;