var item = require('./example/enum.joi.js');
var _ = require('lodash');

var models = [];
_.each(item._inner.children, (child) => {
    models.push(parseObject({}, child));
});
var modelObject = {};
// unroll the array into an object
_.each(models, (model) => {
    var key = Object.keys(model);
    modelObject[key] = model[key];
});

console.log(JSON.stringify(modelObject));

function parseObject(obj, property) {
    if (property.key) {
        obj[property.key] = {};
        obj[property.key].type = property.schema._type;
    }
    // if generic number, convert to float
    if (property.schema._type == 'number') {
        obj[property.key].type = 'float';
    }
    // if array, append each type
    if (property.schema._type == 'array') {
        _.each(property.schema._inner.inclusions, (include) => {
            if (include._tests && include._tests.length > 1) {
                obj[property.key].array_types = [];
                _.each(include._tests, (test) => {
                    obj[property.key].array_types.push(test.name);
                });
            } else {
                obj[property.key].array_type = include._type;
            }
            if (include._type == 'object') {
                // allow only
                var newObj = parseObject({}, include);
                obj[property.key].array_type = newObj;
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
    // enum?
    if (property.schema._valids && property.schema._valids._set && property.schema._valids._set.length) {
        obj[property.key].enum = [];
        _.each(property.schema._valids._set, (prop) => {
            obj[property.key].enum.push(prop);
        });
    }

    if (property._type === "object") {
        if (property._inner && property._inner.children && property._inner.children.length) {
        _.each(property._inner.children, (child) => {
                var newObj = parseObject({}, child);
                obj[child.key] = newObj[child.key];
            });
        }
    }

    // is an object? iterate children
    if (property.schema && property.schema._inner && property.schema._inner.children && property.schema._inner.children.length > 0) {
        obj[property.key].properties = [];
        _.each(property.schema._inner.children, (child) => {
            var newObj = parseObject({}, child);
            obj[property.key].properties.push(newObj);
        });
    }
    return obj;
};