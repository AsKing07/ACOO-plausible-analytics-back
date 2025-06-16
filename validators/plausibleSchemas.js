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
