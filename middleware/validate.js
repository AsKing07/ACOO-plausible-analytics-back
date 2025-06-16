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
