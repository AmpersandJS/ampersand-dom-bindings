var Store = require('key-tree-store');
var isArray = require('is-array');
var dom = require('ampersand-dom');


// returns a key-tree-store of functions
// that can be applied to any element/model.

// all resulting functions should be called
// like func(el, value, lastKeyName)
module.exports = function (bindings) {
    var store = new Store();
    var key, current;

    for (key in bindings) {
        current = bindings[key];
        if (typeof current === 'string') {
            store.add(key, getBindingFunc({
                type: 'text',
                selector: current
            }));
        } else if (current.forEach) {
            current.forEach(function (binding) {
                store.add(key, getBindingFunc(binding));
            });
        } else {
            store.add(key, getBindingFunc(current));
        }
    }

    return store;
};


var slice = Array.prototype.slice;

function getMatches(el, selector, func) {
    if (selector === '') return [el];
    return slice.call(el.querySelectorAll(selector));
}

function getBindingFunc(binding) {
    var type = binding.type || 'text';
    var hasSelector = true;
    var selector = (function () {
        if (typeof binding.selector === 'string') {
            return binding.selector;
        } else if (binding.role) {
            return '[role="' + binding.role + '"]';
        } else {
            return '';
        }
    })();

    // storage variable for previous if relevant
    var previousValue = '';

    if (type === 'text') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.text(match, value);
            });
        };
    } else if (type === 'class') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.switchClass(match, previousValue, value);
            });
            previousValue = value;
        };
    } else if (type === 'attribute') {
        if (!binding.name) throw Error('attribute bindings must have a "name"');
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.setAttribute(match, binding.name, value);
            });
            previousValue = value;
        };
    } else if (type === 'booleanClass') {
        // if there's a `no` case this is actually a switch
        if (binding.no) {
            return function (el, value, keyName) {
                var name = binding.name || binding.yes || keyName;
                getMatches(el, selector).forEach(function (match) {
                    dom.switchClass(match, binding.no, name);
                });
            };
        } else {
            return function (el, value, keyName) {
                var name = binding.name || keyName;
                getMatches(el, selector).forEach(function (match) {
                    dom[value ? 'addClass' : 'removeClass'](match, name);
                });
            };
        }
    } else if (type === 'booleanAttribute') {
        return function (el, value, keyName) {
            var name = binding.name || keyName;
            getMatches(el, selector).forEach(function (match) {
                if (!name) debugger;
                dom[value ? 'addAttribute' : 'removeAttribute'](match, name);
            });
        };
    } else if (type === 'toggle') {
        // this doesn't require a selector since we can pass yes/no selectors
        if (binding.yes && binding.no) {
            return function (el, value) {
                getMatches(el, binding.yes).forEach(function (match) {
                    dom[value ? 'show' : 'hide'](match);
                });
                getMatches(el, binding.no).forEach(function (match) {
                    dom[value ? 'hide' : 'show'](match);
                });
            };
        } else {
                return function (el, value) {
                getMatches(el, selector).forEach(function (match) {
                    dom[value ? 'show' : 'hide'](match);
                });
            };
        }
    } else if (type === 'switch') {
        if (!binding.cases) throw Error('switch bindings must have "cases"');
        return function (el, value) {
            for (var item in binding.cases) {
                getMatches(el, binding.cases[item]).forEach(function (match) {
                    dom[value === item ? 'show' : 'hide'](match);
                });
            }
        };
    } else if (type === 'innerHTML') {
        return function (el, value) {
            getMatches(el, selector).forEach(function (match) {
                dom.html(match, value);
            });
        };
    } else {
        throw new Error('no such binding type: ' + type);
    }
}
