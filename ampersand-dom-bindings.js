/*$AMPERSAND_VERSION*/
var Store = require('key-tree-store');
var dom = require('ampersand-dom');
var matchesSelector = require('matches-selector');
var slice = Array.prototype.slice;

function getSelector(binding) {
    if (typeof binding.selector === 'string') {
        return binding.selector;
    } else if (binding.hook) {
        return '[data-hook~="' + binding.hook + '"]';
    } else {
        return '';
    }
}

function getMatches(el, selector) {
    if (selector === '') return [el];
    var matches = [];
    if (matchesSelector(el, selector)) matches.push(el);
    return matches.concat(slice.call(el.querySelectorAll(selector)));
}

function setAttributes(el, attrs) {
    for (var name in attrs) {
        dom.setAttribute(el, name, attrs[name]);
    }
}

function removeAttributes(el, attrs) {
    for (var name in attrs) {
        dom.removeAttribute(el, name);
    }
}

function makeArray(val) {
    return Array.isArray(val) ? val : [val];
}

function switchHandler(binding) {
    if (!binding.cases) throw Error('switch bindings must have "cases"');
    return function (el, value) {
        // the element selector to show
        var showValue = binding.cases[value];
        // hide all the other elements with a different value
        for (var item in binding.cases) {
            var curValue = binding.cases[item];
            if (value !== item && curValue !== showValue) {
                getMatches(el, curValue).forEach(function (match) {
                    dom.hide(match);
                });
            }
        }
        getMatches(el, showValue).forEach(function (match) {
            dom.show(match);
        });
    };
}

function textHandler(binding) {
    var selector = getSelector(binding);

    return function (el, value) {
        getMatches(el, selector).forEach(function (match) {
            dom.text(match, value);
        });
    };
}

function classHandler(binding) {
    var selector = getSelector(binding);
    var previousValue;

    return function(el, value) {
        getMatches(el, selector).forEach(function (match) {
            dom.switchClass(match, previousValue, value);
        });
        previousValue = value;
    };
}

function attributeHandler(binding) {
    if (!binding.name) throw Error('attribute bindings must have a "name"');
    var selector = getSelector(binding);
    var previousValue;

    return function (el, value) {
        var names = makeArray(binding.name);
        getMatches(el, selector).forEach(function (match) {
            names.forEach(function (name) {
                dom.setAttribute(match, name, value);
            });
        });
        previousValue = value;
    };
}

function valueHandler(binding) {
    var selector = getSelector(binding);
    var previousValue;

    return function (el, value) {
        getMatches(el, selector).forEach(function (match) {
            if (!value && value !== 0) value = '';
            // only apply bindings if element is not currently focused
            if (document.activeElement !== match) match.value = value;
        });
        previousValue = value;
    };
}

function booleanClassHandler(binding) {
    var selector = getSelector(binding);
    var yes = binding.yes;
    var no = binding.no;
    var hasYesNo = !!(yes || no);

    // if there's a `no` case this is actually a switch
    if (hasYesNo) {
        yes = makeArray(yes || '');
        no = makeArray(no || '');
        return function (el, value) {
            var prevClass = value ? no : yes;
            var newClass = value ? yes : no;
            getMatches(el, selector).forEach(function (match) {
                prevClass.forEach(function (pc) {
                    dom.removeClass(match, pc);
                });
                newClass.forEach(function (nc) {
                    dom.addClass(match, nc);
                });
            });
        };
    }

    return function (el, value, keyName) {
        var name = makeArray(binding.name || keyName);
        getMatches(el, selector).forEach(function (match) {
            name.forEach(function (className) {
                dom[value ? 'addClass' : 'removeClass'](match, className);
            });
        });
    };
}

function booleanAttributeHandler(binding) {
    var selector = getSelector(binding);
    var yes = binding.yes;
    var no = binding.no;
    var hasYesNo = !!(yes || no);

    // if there are `yes` and `no` selectors, this swaps between them
    if (hasYesNo) {
        yes = makeArray(yes || '');
        no = makeArray(no || '');
        return function (el, value) {
            var prevAttribute = value ? no : yes;
            var newAttribute = value ? yes : no;
            getMatches(el, selector).forEach(function (match) {
                prevAttribute.forEach(function (pa) {
                    if (pa) {
                        dom.removeAttribute(match, pa);
                    }
                });
                newAttribute.forEach(function (na) {
                    if (na) {
                        dom.addAttribute(match, na);
                    }
                });
            });
        };
    }

    return function (el, value, keyName) {
        var name = makeArray(binding.name || keyName);
        getMatches(el, selector).forEach(function (match) {
            name.forEach(function (attr) {
                dom[value ? 'addAttribute' : 'removeAttribute'](match, attr);
            });
        });
    };
}

function toggleHandler(binding) {
    var selector = getSelector(binding);
    var yes = binding.yes;
    var no = binding.no;
    var hasYesNo = !!(yes || no);
    var mode = (binding.mode || 'display');

    // this doesn't require a selector since we can pass yes/no selectors
    if (hasYesNo) {
        return function (el, value) {
            getMatches(el, yes).forEach(function (match) {
                dom[value ? 'show' : 'hide'](match, mode);
            });
            getMatches(el, no).forEach(function (match) {
                dom[value ? 'hide' : 'show'](match, mode);
            });
        };
    }

    return function (el, value) {
        getMatches(el, selector).forEach(function (match) {
            dom[value ? 'show' : 'hide'](match, mode);
        });
    };
}

function innerHTMLHandler(binding) {
    var selector = getSelector(binding);

    return function (el, value) {
        getMatches(el, selector).forEach(function (match) {
            dom.html(match, value);
        });
    };
}

function switchClassHandler(binding) {
    if (!binding.cases) throw Error('switchClass bindings must have "cases"');

    return function (el, value, keyName) {
        var name = makeArray(binding.name || keyName);
        for (var item in binding.cases) {
            getMatches(el, binding.cases[item]).forEach(function (match) {
                name.forEach(function (className) {
                    dom[value === item ? 'addClass' : 'removeClass'](match, className);
                });
            });
        }
    };
}

function switchAttributeHandler(binding) {
    if (!binding.cases) throw Error('switchAttribute bindings must have "cases"');
    var selector = getSelector(binding);
    var previousValue;

    return function (el, value, keyName) {
        getMatches(el, selector).forEach(function (match) {
            if (previousValue) {
                removeAttributes(match, previousValue);
            }

            if (value in binding.cases) {
                var attrs = binding.cases[value];
                if (typeof attrs === 'string') {
                    attrs = {};
                    attrs[binding.name || keyName] = binding.cases[value];
                }
                setAttributes(match, attrs);

                previousValue = attrs;
            }
        });
    };
}

function customBindingHandler(binding, context) {
    var selector = getSelector(binding);
    var type = binding.type || 'text';
    var previousValue;

    return function (el, value) {
        getMatches(el, selector).forEach(function (match) {
            type.call(context, match, value, previousValue);
        });
        previousValue = value;
    };
}

function getBindingFunc(binding, context) {
    var type = binding.type || 'text';
    var isCustomBinding = typeof type === 'function';

    if (isCustomBinding) {
        return customBindingHandler(binding, context);
    }
    if (type === 'text') {
        return textHandler(binding, context);
    }
    if (type === 'class') {
        return classHandler(binding, context);
    }
    if (type === 'attribute') {
        return attributeHandler(binding, context);
    }
    if (type === 'value') {
        return valueHandler(binding, context);
    }
    if (type === 'booleanClass') {
        return booleanClassHandler(binding, context);
    }
    if (type === 'booleanAttribute') {
        return booleanAttributeHandler(binding, context);
    }
    if (type === 'toggle') {
        return toggleHandler(binding, context);
    }
    if (type === 'switch') {
        return switchHandler(binding, context);
    }
    if (type === 'innerHTML') {
        return innerHTMLHandler(binding, context);
    }
    if (type === 'switchClass') {
        return switchClassHandler(binding, context);
    }
    if (type === 'switchAttribute') {
        return switchAttributeHandler(binding, context);
    }
    throw new Error('no such binding type: ' + type);
}

// returns a key-tree-store of functions
// that can be applied to any element/model.

// all resulting functions should be called
// like func(el, value, lastKeyName)
module.exports = function (bindings, context) {
    var store = new Store();
    var key, current;

    for (key in bindings) {
        current = bindings[key];
        if (typeof current === 'string') {
            // string defaults to a text selector
            store.add(key, getBindingFunc({
                type: 'text',
                selector: current
            }));
        } else if (current.forEach) {
            // user passes in an array of bindings
            current.forEach(function (binding) {
                store.add(key, getBindingFunc(binding, context));
            });
        } else {
            // an object for binding
            store.add(key, getBindingFunc(current, context));
        }
    }

    return store;
};
