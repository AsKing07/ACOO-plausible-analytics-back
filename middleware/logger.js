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

// Middleware function that logs each request using the Logger class
const loggerInstance = new Logger();

module.exports = function loggerMiddleware(req, res, next) {
  loggerInstance.info(`${req.method} ${req.url}`, { ip: req.ip });
  next();
};

module.exports.loggerInstance = loggerInstance; // Export the logger instance for use in other parts of the application