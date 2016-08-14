const Joi = require('joi');

module.exports = Joi.object().keys({
   ref_id: Joi.string().guid().required(),
   fk_self: Joi.string().guid().allow(null),
   fk_feature: Joi.string().guid(),
   menu: Joi.object().keys({
       name: Joi.string().min(1).max(255).required(),
       description: Joi.string().min(3).required(),
       is_active: Joi.boolean().required(),
       welcome_message: Joi.string().min(1).max(255).required(),
       fk_request_template: Joi.string().guid().allow(null).required(),
       fk_logo: Joi.string().guid().allow(null).required(),
       images: Joi.array().items(Joi.string().guid().allow(null)).required(),
       gratuity: Joi.object().keys({
           percent: Joi.number().precision(2).min(0.00).max(100.00).required(),
           partyMin: Joi.number().min(0).required()
       }).allow(null).required(),
       localization: Joi.object().keys({
         language: Joi.string().required(),
         locale: Joi.string().allow(null).required()
       }).required(),
       ordinal: Joi.number().integer().min(0).required(),
       sections: Joi.array().items(Joi.string().guid().allow(null)).required()
   }).required(),
   created_on: Joi.date().timestamp(),
   updated_on: Joi.date().timestamp(),
   links: Joi.object()
});