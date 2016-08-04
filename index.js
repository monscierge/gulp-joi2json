const Joi = require('joi');
const _ = require('lodash');
const path = require('path');
const through = require('through2');
const gutil = require('gulp-util');

module.exports = function() {
    function replaceExtension(path) {
        return gutil.replaceExtension(path, '.json');
    }
    
    return through.obj(function convertMe(file, enc, cb) {
        var item = require(file.path);

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
        file.contents = new Buffer(JSON.stringify(modelObject));
        file.path = replaceExtension(file.path);
        this.push(file);
        return cb();
    });

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
    };
};