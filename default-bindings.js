var castArray = require('lodash/castArray');
var dom = require('ampersand-dom');
var partial = require('lodash/partial');
var utils = require('./libs/utils');

module.exports = {
    'function': function (binding, selector) {
        var type = binding.type;
        var firstMatchOnly = binding.firstMatchOnly;
        var previousValue;
        var context = this;

        return function (el, value) {
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                type.call(context, match, value, previousValue);
            });
            previousValue = value;
        };
    },
    'text': function (binding, selector) {
        var firstMatchOnly = binding.firstMatchOnly;

        return function (el, value) {
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                dom.text(match, value);
            });
        };
    },
    'class': function (binding, selector) {
        var previousValue;
        var firstMatchOnly = binding.firstMatchOnly;

        return function (el, value) {
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                dom.switchClass(match, previousValue, value);
            });
            previousValue = value;
        };
    },
    'attribute': function (binding, selector) {
        if (!binding.name) throw Error('attribute bindings must have a "name"');
        var previousValue;
        var firstMatchOnly = binding.firstMatchOnly;

        return function (el, value) {
            var names = castArray(binding.name);
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                names.forEach(function (name) {
                    dom.setAttribute(match, name, value);
                });
            });
            previousValue = value;
        };
    },
    'value': function (binding, selector) {
        return function (el, value) {
            var previousValue;
            var firstMatchOnly = binding.firstMatchOnly;

            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                if (!value && value !== 0) value = '';
                // only apply bindings if element is not currently focused
                if (document.activeElement !== match) match.value = value;
            });
            previousValue = value;
        };
    },
    'booleanClass': function (binding, selector) {
        var yes = binding.yes;
        var no = binding.no;
        var hasYesNo = !!(yes || no);
        var firstMatchOnly = binding.firstMatchOnly;
        // if there's a `no` case this is actually a switch
        if (hasYesNo) {
            yes = castArray(yes || '');
            no = castArray(no || '');
            return function (el, value) {
                var prevClass = value ? no : yes;
                var newClass = value ? yes : no;
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    prevClass.forEach(function (pc) {
                        dom.removeClass(match, pc);
                    });
                    newClass.forEach(function (nc) {
                        dom.addClass(match, nc);
                    });
                });
            };
        } else {
            return function (el, value, keyName) {
                var name = castArray(binding.name || keyName);
                var invert = (binding.invert || false);
                value = (invert ? (value ? false : true) : value);
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    name.forEach(function (className) {
                        dom[value ? 'addClass' : 'removeClass'](match, className);
                    });
                });
            };
        }
    },
    'booleanAttribute': function (binding, selector) {
        var yes = binding.yes;
        var no = binding.no;
        var hasYesNo = !!(yes || no);
        var firstMatchOnly = binding.firstMatchOnly;
        // if there are `yes` and `no` selectors, this swaps between them
        if (hasYesNo) {
            yes = castArray(yes || '');
            no = castArray(no || '');
            return function (el, value) {
                var prevAttribute = value ? no : yes;
                var newAttribute = value ? yes : no;
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
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
        } else {
            return function (el, value, keyName) {
                var name = castArray(binding.name || keyName);
                var invert = (binding.invert || false);
                value = (invert ? (value ? false : true) : value);
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    name.forEach(function (attr) {
                        dom[value ? 'addAttribute' : 'removeAttribute'](match, attr);
                    });
                });
            };
        }
    },
    'toggle': function (binding, selector) {
        var yes = binding.yes;
        var no = binding.no;
        var hasYesNo = !!(yes || no);
        var mode = (binding.mode || 'display');
        var invert = (binding.invert || false);
        var firstMatchOnly = binding.firstMatchOnly;
        // this doesn't require a selector since we can pass yes/no selectors
        if (hasYesNo) {
            return function (el, value) {
                utils.getMatches(el, yes, firstMatchOnly).forEach(function (match) {
                    dom[value ? 'show' : 'hide'](match, mode);
                });
                utils.getMatches(el, no, firstMatchOnly).forEach(function (match) {
                    dom[value ? 'hide' : 'show'](match, mode);
                });
            };
        } else {
            return function (el, value) {
                value = (invert ? (value ? false : true) : value);
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    dom[value ? 'show' : 'hide'](match, mode);
                });
            };
        }
    },
    'switch': function (binding) {
        if (!binding.cases) throw Error('switch bindings must have "cases"');

        return partial(function (binding, el, value) {
            // the element selector to show
            var showValue = binding.cases[value];
            var firstMatchOnly = binding.firstMatchOnly;

            // hide all the other elements with a different value
            for (var item in binding.cases) {
                var curValue = binding.cases[item];

                if (value !== item && curValue !== showValue) {
                    utils.getMatches(el, curValue, firstMatchOnly).forEach(function (match) {
                        dom.hide(match);
                    });
                }
            }
            utils.getMatches(el, showValue, firstMatchOnly).forEach(function (match) {
                dom.show(match);
            });
        }, binding);
    },
    'innerHTML': function (binding, selector) {
        var firstMatchOnly = binding.firstMatchOnly;

        return function (el, value) {
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                dom.html(match, value);
            });
        };
    },
    'switchClass': function (binding) {
        if (!binding.cases) throw Error('switchClass bindings must have "cases"');
        var firstMatchOnly = binding.firstMatchOnly;

        return function (el, value, keyName) {
            var name = castArray(binding.name || keyName);
            for (var item in binding.cases) {
                utils.getMatches(el, binding.cases[item], firstMatchOnly).forEach(function (match) {
                    name.forEach(function (className) {
                        dom[value === item ? 'addClass' : 'removeClass'](match, className);
                    });
                });
            }
        };
    },
    'switchAttribute': function (binding, selector) {
        if (!binding.cases) throw Error('switchAttribute bindings must have "cases"');
        var previousValue;
        var firstMatchOnly = binding.firstMatchOnly;

        return function (el, value, keyName) {
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                if (previousValue) {
                    utils.removeAttributes(match, previousValue);
                }

                if (value in binding.cases) {
                    var attrs = binding.cases[value];
                    if (typeof attrs === 'string') {
                        attrs = {};
                        attrs[binding.name || keyName] = binding.cases[value];
                    }
                    utils.setAttributes(match, attrs);

                    previousValue = attrs;
                }
            });
        };
    }
};