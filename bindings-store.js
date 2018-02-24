var assign = require('lodash/assign');
var baseBindings = require('./default-bindings');
var cloneObj = function (obj) { return assign({}, obj); };
var isUndefined = require('lodash/isUndefined');
var toArray = require('lodash/toArray');

module.exports = {
    //create a copy of the basebindings
    _bindings: cloneObj(baseBindings),
    get: function (key) {
        return this._bindings[key];
    },
    hasKey: function (key) {
        return !isUndefined(this.get(key));
    },
    extend: function () {
        var args = toArray(arguments);
        args.unshift(this._bindings);
        // the base bindings are considered reserved keywords, and cannot be overwritten
        args.push(baseBindings);
        this._bindings = assign.apply(null, args);
        return this;
    },
    reset: function () {
        this._bindings = cloneObj(baseBindings);
        return this;
    }
};