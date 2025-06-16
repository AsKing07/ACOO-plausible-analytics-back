# Middlewares et Utilitaires - Code complet

## middleware/errorHandler.js - Gestionnaire d'erreurs global

```javascript
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Erreur capturée:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      message: err.message,
      details: err.details
    });
  }

  // Erreurs d'authentification
  if (err.name === 'UnauthorizedError' || err.message.includes('API invalide')) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé',
      message: 'Clé API invalide ou manquante'
    });
  }

  // Erreurs de l'API Plausible
  if (err.message.includes('Plausible')) {
    return res.status(502).json({
      success: false,
      error: 'Erreur API externe',
      message: err.message
    });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erreur interne du serveur' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: 'Erreur serveur',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

## middleware/auth.js - Middleware d'authentification

```javascript
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthMiddleware {
  /**
   * Valider la clé API dans les headers
   */
  validateApiKey(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Token manquant',
          message: 'Header Authorization requis'
        });
      }
      
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Format de token invalide',
          message: 'Le token doit être au format "Bearer <token>"'
        });
      }
      
      const token = authHeader.substring(7);
      
      if (!token || token.length < 10) {
        return res.status(401).json({
          success: false,
          error: 'Token invalide',
          message: 'Le token fourni est invalide'
        });
      }
      
      // Stocker le token pour utilisation ultérieure
      req.plausibleApiKey = token;
      
      logger.info(`Authentification réussie pour l'IP: ${req.ip}`);
      next();
      
    } catch (error) {
      logger.error('Erreur d\'authentification:', error);
      res.status(401).json({
        success: false,
        error: 'Erreur d\'authentification',
        message: 'Impossible de valider le token'
      });
    }
  }
  
  /**
   * Middleware optionnel pour JWT (si utilisé)
   */
  validateJWT(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token JWT manquant'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
      
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token JWT invalide'
      });
    }
  }
}

module.exports = new AuthMiddleware();
```

## middleware/validate.js - Middleware de validation

```javascript
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate({
      ...req.body,
      ...req.query,
      ...req.params
    });
    
    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.name = 'ValidationError';
      validationError.details = error.details;
      return next(validationError);
    }
    
    next();
  };
};

module.exports = validate;
```

## validators/plausibleSchemas.js - Schémas de validation

```javascript
const Joi = require('joi');

const plausibleSchemas = {
  realtime: Joi.object({
    site_id: Joi.string().required().messages({
      'string.empty': 'Le site_id est requis',
      'any.required': 'Le site_id est requis'
    })
  }),
  
  timeseries: Joi.object({
    site_id: Joi.string().required(),
    period: Joi.string().valid('12mo', '6mo', 'month', '30d', '7d', 'day', 'custom').default('7d'),
    metrics: Joi.string().default('visitors'),
    interval: Joi.string().valid('date', 'month').default('date'),
    date: Joi.string().when('period', {
      is: 'custom',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),
  
  breakdown: Joi.object({
    site_id: Joi.string().required(),
    property: Joi.string().valid(
      'visit:source', 'visit:utm_source', 'visit:utm_medium', 'visit:utm_campaign',
      'visit:device', 'visit:browser', 'visit:os', 'visit:country', 'visit:region',
      'visit:city', 'event:page', 'event:name'
    ).required(),
    period: Joi.string().valid('12mo', '6mo', 'month', '30d', '7d', 'day', 'custom').default('7d'),
    metrics: Joi.string().default('visitors'),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  aggregate: Joi.object({
    site_id: Joi.string().required(),
    period: Joi.string().valid('12mo', '6mo', 'month', '30d', '7d', 'day', 'custom').default('7d'),
    metrics: Joi.string().default('visitors,pageviews,bounce_rate,visit_duration'),
    compare: Joi.boolean().default(false),
    filters: Joi.string().optional()
  }),
  
  testConnection: Joi.object({
    api_key: Joi.string().required().messages({
      'string.empty': 'La clé API est requise',
      'any.required': 'La clé API est requise'
    }),
    site_id: Joi.string().required().messages({
      'string.empty': 'Le site_id est requis',
      'any.required': 'Le site_id est requis'
    })
  })
};

module.exports = { plausibleSchemas };
```

## utils/cache.js - Système de cache

```javascript
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
```

## utils/logger.js - Système de logging

```javascript
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }
  
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const formattedMeta = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${formattedMeta}`;
  }
  
  writeToFile(level, message) {
    const logFile = path.join(this.logDir, `${level}.log`);
    fs.appendFileSync(logFile, message + '\n');
  }
  
  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Afficher dans la console
    console.log(formattedMessage);
    
    // Écrire dans le fichier en production
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(level, formattedMessage);
    }
  }
  
  info(message, meta = {}) {
    this.log('info', message, meta);
  }
  
  error(message, meta = {}) {
    this.log('error', message, meta);
  }
  
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }
  
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

module.exports = new Logger();
```

## Instructions d'installation et d'utilisation

### Installation

```bash
# Cloner ou créer le projet
mkdir plausible-api-express
cd plausible-api-express

# Initialiser le projet
npm init -y

# Installer les dépendances
npm install express cors helmet express-rate-limit dotenv axios joi jsonwebtoken node-cache

# Installer les dépendances de développement
npm install --save-dev nodemon jest supertest eslint

# Créer la structure des dossiers
mkdir -p routes controllers services middleware validators utils logs public

# Créer le fichier .env
touch .env
```

### Configuration .env

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
PLAUSIBLE_BASE_URL=https://plausible.io
PLAUSIBLE_API_VERSION=v2
JWT_SECRET=votre_secret_jwt_super_securise
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=300
```

### Utilisation

```bash
# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start

# Tester l'API
curl -X GET "http://localhost:3000/api/plausible/realtime?site_id=example.com" \
  -H "Authorization: Bearer VOTRE_CLE_API_PLAUSIBLE"
```

### Endpoints disponibles

- `GET /api/plausible/realtime?site_id=example.com` - Visiteurs en temps réel
- `GET /api/plausible/timeseries?site_id=example.com&period=7d` - Données temporelles
- `GET /api/plausible/breakdown/visit:source?site_id=example.com` - Répartition par source
- `GET /api/plausible/aggregate?site_id=example.com` - Métriques agrégées
- `POST /api/plausible/test-connection` - Test de connexion