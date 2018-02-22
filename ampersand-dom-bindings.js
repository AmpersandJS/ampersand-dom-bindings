/*$AMPERSAND_VERSION*/
var BindingStore = require('./bindings-store');
var KeyStore = require('key-tree-store');

function getSelector(binding) {
    if (typeof binding.selector === 'string') {
        return binding.selector;
    } else if (binding.hook) {
        return '[data-hook~="' + binding.hook + '"]';
    } else {
        return '';
    }
}

// Get the binding name to access from the binding store
function getType(type) {
    if (type) {
        if (typeof type === 'string') {
            return type;
        } else if (typeof type === 'function') {
            return 'function';
        }
    }

    //returning the passed type by default maintains backwards compatability for throwing 'no such binding type: '
    return type;
}

// Returns a curried version of the binding store function to update the dom when coressponding events are fired
function getBindingFunc(binding, context) {
    var type = getType(binding.type);
    var selector = getSelector(binding);
    
    if (BindingStore.hasKey(type)) {
        return BindingStore.get(type).call(context, binding, selector);
    } else {
        throw new Error('no such binding type: ' + type);
    }
}

// returns a key-tree-store of functions
// that can be applied to any element/model.

// all resulting functions should be called
// like func(el, value, lastKeyName)
module.exports = function (bindings, context) {
    var store = new KeyStore();
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
                store.add(key, getBindingFunc(binding, context));
            });
        } else {
            store.add(key, getBindingFunc(current, context));
        }
    }

    return store;
};