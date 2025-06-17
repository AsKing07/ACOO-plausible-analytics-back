require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const plausibleRoutes = require('./routes/plausible');
const docsRoutes = require('./routes/docs');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Vérification que logger est bien une fonction middleware
if (typeof logger !== 'function') {
  throw new Error('Le middleware logger doit exporter une fonction. Vérifiez ./middleware/logger.js');
}

const app = express();
 //Utiliser dotenv pour charger les variables d'environnement
const PORT = process.env.PORT || 3000;



// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limite de 150 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
  }
});

// Middlewares de sécurité
app.use(helmet());
app.use(limiter);

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use(logger);

// Servir les fichiers statiques (pour le frontend)
app.use(express.static('public'));

// Routes
app.use('/api/plausible', plausibleRoutes);
app.use('/api/docs', docsRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});


// Gestion des routes non trouvées
app.all('/{*any}', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `L'endpoint ${req.originalUrl} n'existe pas`
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejection non gérée à:', promise, 'raison:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  process.exit(1);
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 API Plausible disponible sur http://localhost:${PORT}`);
  console.log(`🌐 Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
