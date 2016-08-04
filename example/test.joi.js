const Joi = require('joi');

module.exports = Joi.object().keys({
    ref_id: Joi.string().guid(),
    fk_menu: Joi.string().guid(),
    menu_section: Joi.object().keys({
        name: Joi.string().min(1).max(255).required(),
        description: Joi.string().min(3).required(),
        is_active: Joi.boolean().required(),
        images: Joi.array().items(Joi.string().guid()),
        ordinal: Joi.number().integer().min(0).required(),
        items: Joi.array().items()
    }),
    created_on: Joi.date().timestamp().required(),
    updated_on: Joi.date().timestamp().required()
});