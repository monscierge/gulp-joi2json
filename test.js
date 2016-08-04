const Joi = require('joi');
const _ = require('lodash');

var section = Joi.object().keys({
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

var item = Joi.object().keys({
   ref_id: Joi.string().guid(),
   email_address: Joi.string().email().required(),
   testing: Joi.string().regex(/[0-9](0)/),
   fk_feature: Joi.string().guid().required(),
   menu: Joi.object().keys({
       name: Joi.string().min(1).max(255).required(),
       description: Joi.string().min(3).required(),
       is_active: Joi.boolean().required(),
       welcome_message: Joi.string().min(1).max(255).required(),
       fk_request_template: Joi.string().guid(),
       fk_logo: Joi.string().guid().allow(null),
       images: Joi.array().items(Joi.string().guid()).allow(null),
       gratuity: Joi.object().keys({
           percent: Joi.number().min(0.00),
           min: Joi.number().min(0.00)
       }),
       localization: Joi.object().keys({
         language: Joi.string(),
         locale: Joi.string().allow(null)
       }),
       ordinal: Joi.number().integer().min(0).required(),
       sections: Joi.array().items(section).required()
   }).required(),
   created_on: Joi.date().timestamp().required(),
   updated_on: Joi.date().timestamp().required()
});

var model = [];
_.each(item._inner.children, (child) => {
    model.push(parseObject({}, child));
});

console.log(JSON.stringify(model));
console.log(model);

function parseObject(obj, property) {
    obj[property.key] = {};
    obj[property.key].type = property.schema._type;
    // if generic number, convert to float
    if (property.schema._type == 'number') {
        obj[property.key].type = 'float';
    }
    // if array, append each type
    if (property.schema._type == 'array') {
        obj[property.key].array_types = [];
        _.each(property.schema._inner.inclusions, (include) => {
            if (include._tests) {
                _.each(include._tests, (test) => {
                    obj[property.key].array_types.push(test.name);
                });
            }
            if (include._type == 'object') {
                obj[property.key].array_types.push("object");
                // var objectProperties = [];
                // var objectObject = {};
                // _.each(include._inner.children, (child) => {
                //     var newObj = parseObject({}, child);
                //     objectProperties.push(newObj);
                // });
                // _.each(objectProperties, (prop) => {
                //     var key = Object.keys(prop)[0];
                //     objectObject[key] = prop[key];
                // });
                // obj[property.key].array_types.push(objectObject);
            }
        });
    }
    // figure out type
    if (property.schema._tests && property.schema._tests.length > 0) {
        _.each(property.schema._tests, (test) => {
            if (test.name == 'guid' || test.name == 'integer' || test.name == 'boolean' || test.name == 'email') {
                obj[property.key].type = test.name;
            } else if (test.name == 'min') {
                obj[property.key].min = test.arg;
            } else if (test.name == 'max') { 
                obj[property.key].max = test.arg;
            } else if (test.name == 'regex') {
                obj[property.key].type = test.name;
                obj[property.key].pattern = property.schema._tests[0].arg.toString();
            }
        });
    }
    // is it required?
    if (property.schema._flags && property.schema._flags.presence == "required") {
        obj[property.key].required = true;
    }
    // is an object? iterate children
    if (property.schema._inner.children && property.schema._inner.children.length > 0) {
        obj[property.key].properties = [];
        _.each(property.schema._inner.children, (child) => {
            var newObj = parseObject({}, child);
            obj[property.key].properties.push(newObj);
        });
    }
    return obj;
}