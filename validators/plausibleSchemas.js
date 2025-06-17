const Joi = require('joi');

const plausibleSchemas = {
  realtime: Joi.object({
    site_id: Joi.string().required().messages({
      'string.empty': 'Le site_id est requis',
      'any.required': 'Le site_id est requis'
    })
  }),
  timeseries: {
    query: Joi.object({
      site_id: Joi.string().required(),
      period: Joi.string().valid('12mo', '6mo', 'month', '30d', '7d', 'day', 'custom').default('7d'),
      metrics: Joi.string().default('visitors'),
      dimensions: Joi.optional(),
      // interval: Joi.string().valid('date', 'month').optional(),
      date: Joi.string().when('period', {
        is: 'custom',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  },
breakdown: {
  query: Joi.object({
    dimensions: Joi.alternatives().try(
  Joi.array().items(
    Joi.string().pattern(/^(visit|event):.+/)
  ),
  Joi.string().pattern(/^(visit|event):.+/)
).optional(),
    site_id: Joi.string().required(),
    period: Joi.string().valid('12mo', '6mo', 'month', '30d', '7d', 'day', 'custom').default('7d'),
    metrics: Joi.string().default('visitors'),
    // limit: Joi.number().integer().min(1).max(100).default(10)
  })
},
  
  aggregate: {
    query: Joi.object({
      site_id: Joi.string().required(),
      period: Joi.string().valid('12mo', '6mo', 'month', '30d', '7d', 'day', 'custom').default('7d'),
      metrics: Joi.string().default('visitors,pageviews,bounce_rate,visit_duration'),
      compare: Joi.boolean().default(false),
      filters: Joi.string().optional()
    })
  },
  
  testConnection: {
    body: Joi.object({
      api_key: Joi.string().required().messages({
        'string.empty': 'La clé API est requise',
        'any.required': 'La clé API est requise'
      }),
      site_id: Joi.string().required().messages({
        'string.empty': 'Le site_id est requis',
        'any.required': 'Le site_id est requis'
      })
    })
  }
};

module.exports = { plausibleSchemas };
