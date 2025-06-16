const {loggerInstance} = require('./logger');
const errorHandler = (err, req, res, next) => {
  loggerInstance.error('Erreur capturée:', {
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
