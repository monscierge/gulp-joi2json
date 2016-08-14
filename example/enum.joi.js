const Joi = require('joi');

module.exports = Joi.object().keys({
  ref_id: Joi.string().guid(),
  fk_menu_section: Joi.string().guid(),
  fk_self: Joi.string().guid().allow(null),
  menu_section_item: Joi.object().keys({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(3).required(),
    is_active: Joi.boolean().required(),
    item_number: Joi.number().integer(),
    images: Joi.array().items(Joi.string().guid().allow(null)).required(),
    ordinal: Joi.number().integer().min(0).required(),
    tags: Joi.array().items(Joi.string().allow(null)).required(),
    prices: Joi.array().items(Joi.object().keys({
      name: Joi.string().allow(null).required(),
      value: Joi.number().precision(2).allow(null).required(),
      currency: Joi.string().valid(['$', '€', '£' ]).required()
    }).allow(null)).required(),
    nutrition: Joi.array().items(Joi.object().keys({
      type: Joi.string().valid(['Calories', 'Cholesterol', 'Dietary Fiber', 'Iron', 'Protein', 'Saturated Fat', 'Sodium', 'Sugars', 'Total Carbohydrates', 'Total Fat', 'Vitamin C']).required(),
      value: Joi.number().required(),
      label: Joi.string().allow(null).valid(['%', 'mg', 'g']).required()
    }).allow(null)).required(),
    allergies: Joi.array().items(Joi.string().allow(null).valid(['Dairy', 'Eggs', 'Fish', 'Moon Dust', 'Nuts', 'Peanuts', 'Red 40', 'Shellfish', 'Soy', 'Tree Nuts', 'Wheat'])).required(),
    pairings: Joi.array().items(Joi.string().guid().allow(null)).required(),
    upsells: Joi.array().items(Joi.string().guid().allow(null)).required()
  }).required(),
  created_on: Joi.date().timestamp(),
  updated_on: Joi.date().timestamp(),
  links: Joi.object()
});