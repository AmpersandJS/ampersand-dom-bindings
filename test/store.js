var bindingsStore = require('../bindings-store');
var defaultBindings = require('../default-bindings');
var dom = require('ampersand-dom');
var domBindings = require('../ampersand-dom-bindings');
var test = require('tape');
var utils = require('../libs/utils');

var extraBindings = {
    'USADate': function (binding, selector) {
        var firstMatchOnly = binding.firstMatchOnly;
        return function (el, value) {
            if (!(value instanceof Date)) throw 'binding requires a date type';
            var date = value.getMonth() + '/' + value.getDay() + '/' + value.getFullYear();
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                dom.text(match, date);
            });
        };
    },
    'EveryoneElseDate': function (binding, selector) {
        var firstMatchOnly = binding.firstMatchOnly;
        return function (el, value) {
            if (!(value instanceof Date)) throw 'binding requires a date type';
            var date = value.getDate() + '/' + value.getMonth() + '/' + value.getFullYear();
            utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                dom.text(match, date);
            });
        };
    }
};

test('_bindings is a unique instance', function (t) {
    t.notEqual(bindingsStore._bindings, defaultBindings, '_bindings and defaultBindings do not reference same object');
    bindingsStore.extend(extraBindings);
    t.notEqual(bindingsStore._bindings, defaultBindings, '_bindings and defaultBindings do not reference same object after extend');
    bindingsStore.reset();
    t.notEqual(bindingsStore._bindings, defaultBindings, '_bindings and defaultBindings do not reference same object after reset');
    t.end();    
});

test('hasKey binding store default bindings', function (t) {
    bindingsStore.reset();

    Object.keys(defaultBindings).forEach(function (key) {
        t.equal(bindingsStore.hasKey(key), true);
    }, this);
    t.end();
});

test('get binding store default bindings', function (t) {
    bindingsStore.reset();

    Object.keys(defaultBindings).forEach(function (key) {
        t.equal(bindingsStore.get(key), defaultBindings[key]);
    }, this);
    t.end();
});

test('extend binding store bindings', function (t) {
    bindingsStore.reset();
    bindingsStore.extend(extraBindings);

    t.assert(bindingsStore.hasKey('USADate'), 'should have key USADate');
    t.assert(bindingsStore.hasKey('EveryoneElseDate'), 'should have key EveryoneElseDate');
    t.equal(bindingsStore.get('USADate'), extraBindings.USADate, 'should get function for USADate');
    t.equal(bindingsStore.get('EveryoneElseDate'), extraBindings.EveryoneElseDate, 'should get function for EveryoneElseDate');
    t.end();
});


test('overwrite bindingstore bindings', function (t) {
    // there are declared with function names to help debug failure cases.
    var overwriteBindings = {
        'USADate': function USADateOverWrite(binding, selector) {
            var firstMatchOnly = binding.firstMatchOnly;
            return function (el, value) {
                if (!(value instanceof Date)) throw 'binding requires a date type';
                var date = value.getMonth() + '-' + value.getDay() + '-' + value.getFullYear();
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    dom.text(match, date);
                });
            };
        },
        'EveryoneElseDate': function EveryoneElseDateOverwrite(binding, selector) {
            var firstMatchOnly = binding.firstMatchOnly;
            return function (el, value) {
                if (!(value instanceof Date)) throw 'binding requires a date type';
                var date = value.getDate() + '-' + value.getMonth() + '-' + value.getFullYear();
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    dom.text(match, date);
                });
            };
        },
        'text': function textOverwrite(binding, selector) {
            var firstMatchOnly = binding.firstMatchOnly;

            return function (el, value) {
                utils.getMatches(el, selector, firstMatchOnly).forEach(function (match) {
                    dom.text(match, value);
                });
            };
        },
    };

    bindingsStore.reset();
    bindingsStore.extend(extraBindings);
    bindingsStore.extend(overwriteBindings);

    t.assert(bindingsStore.hasKey('USADate'), 'should have overwritten key USADate');
    t.assert(bindingsStore.hasKey('EveryoneElseDate'), 'should have overwritten key EveryoneElseDate');
    t.equal(bindingsStore.get('USADate'), overwriteBindings.USADate, 'should get overwritten function for USADate');
    t.equal(bindingsStore.get('EveryoneElseDate'), overwriteBindings.EveryoneElseDate, 'should get overwritten function for EveryoneElseDate');
    t.notEqual(bindingsStore.get('text'), overwriteBindings.text, 'should not have overwritten function for text');
    t.equal(bindingsStore.get('text'), defaultBindings.text, 'should have default function for text');
    t.end();
});

test('using a user defined binding', function (t) {
    bindingsStore.reset();
    bindingsStore.extend(extraBindings);
    
    var el = document.createElement('div');
    el.innerHTML = '<span class="thing" data-hook="date"></span>';

    var bindings = domBindings({
        'model1': {
            type: 'USADate',
            selector: '.thing'
        },
        'model2': {
            type: 'USADate',
            hook: 'date'
        },
        'model3': {
            type: 'EveryoneElseDate',
            selector: '.thing'
        },
        'model4': {
            type: 'EveryoneElseDate',
            hook: 'date'
        },
    });

    var formatDateUSA = function (value) {
        return value.getMonth() + '/' + value.getDay() + '/' + value.getFullYear();
    };
    var formatDateEveryoneElse = function (value) {
        return value.getDate() + '/' + value.getMonth() + '/' + value.getFullYear();
    };
    var date1 = new Date();
    var date2 = new Date();
    date2.setDate(date2.getDate() + 1);


    t.notEqual(el.firstChild.textContent, formatDateUSA(date1), 'empty span should not contain formatted date');
    bindings.run('model1', null, el, date1);
    t.equal(el.innerHTML, '<span class="thing" data-hook="date">' + formatDateUSA(date1) + '</span>', 'should set value of span to usa formatted value of date2');

    bindings.run('model2', null, el, date2);
    t.equal(el.innerHTML, '<span class="thing" data-hook="date">' + formatDateUSA(date2) + '</span>', 'should change value of span to usa formatted value of date1');

    bindings.run('model3', null, el, date1);
    t.equal(el.innerHTML, '<span class="thing" data-hook="date">' + formatDateEveryoneElse(date1) +'</span>', 'should change value of span to everyone else formatted value of date1');

    bindings.run('model4', null, el, date2);
    t.equal(el.innerHTML, '<span class="thing" data-hook="date">' + formatDateEveryoneElse(date2) +'</span>', 'should change value of span to everyone else formatted value of date2');

    t.end();
});

