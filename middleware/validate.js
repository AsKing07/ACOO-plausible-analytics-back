const validate = (schema) => {
  return (req, res, next) => {
    const validationResults = {};
    
    // Valider les différents containers
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation des paramètres échouée',
          details: error.details[0].message
        });
      }
      req.params = value;
    }
    
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation des query parameters échouée',
          details: error.details[0].message
        });
      }
      req.query = value;
    }
    
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation du body échouée',
          details: error.details[0].message
        });
      }
      req.body = value;
    }
    
    next();
  };
};

module.exports = validate;
