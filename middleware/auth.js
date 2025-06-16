
const jwt = require('jsonwebtoken');
const { loggerInstance } = require('./logger');

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
      
      loggerInstance.info(`Authentification réussie pour l'IP: ${req.ip}`);
      next();
      
    } catch (error) {
      loggerInstance.error('Erreur d\'authentification:', error);
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
