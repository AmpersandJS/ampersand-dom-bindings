var test = require('tape');
var domBindings = require('../ampersand-dom-bindings');
var dom = require('ampersand-dom');


function getEl(html) {
    var div = document.createElement('div');
    if (html) div.innerHTML = html;
    return div;
}


test('text bindings', function (t) {
    var el = getEl('<span class="thing" role="hello"></span>');
    var bindings = domBindings({
        'model1': {
            type: 'text',
            selector: '.thing'
        },
        'model2': '.thing',
        'model3': {
            type: 'text',
            role: 'hello'
        }
    });
    t.notEqual(el.firstChild.textContent, 'hello');
    bindings.run('model1', null, el, 'hello');
    t.equal(el.firstChild.textContent, 'hello');

    bindings.run('model2', null, el, 'string');
    t.equal(el.firstChild.textContent, 'string');

    bindings.run('model3', null, el, 'third');
    t.equal(el.firstChild.textContent, 'third');

    t.end();
});

test('class bindings', function (t) {
    var el = getEl('<span class="thing" role="some-role"></span>');
    var bindings = domBindings({
        'model': {
            type: 'class',
            selector: '.thing'
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'hello'));
    bindings.run('model', null, el, 'hello');
    t.ok(dom.hasClass(el.firstChild, 'hello'));

    bindings.run('model', null, el, 'string');
    t.ok(dom.hasClass(el.firstChild, 'string'));
    t.notOk(dom.hasClass(el.firstChild, 'hello'), 'removed previous');

    t.end();
});

test('attribute bindings', function (t) {
    var el = getEl('<span class="thing" role="some-role"></span>');
    var bindings = domBindings({
        'model': {
            type: 'attribute',
            selector: '.thing',
            name: 'data-thing'
        }
    });

    t.equal(el.firstChild.getAttribute('data-thing'), null);
    bindings.run('model', null, el, 'hello');
    t.equal(el.firstChild.getAttribute('data-thing'), 'hello');

    bindings.run('model', null, el, 'string');
    t.ok(el.firstChild.getAttribute('data-thing'), 'string');

    t.end();
});

test('value bindings', function (t) {
    var input = getEl('<input class="thing" type="text">');
    var select = getEl('<select class="thing"><option value=""></option><option value="hello"></option><option value="string"></option></select>');
    var textarea = getEl('<textarea class="thing"></textarea>');

    [input, select, textarea].forEach(function (el) {
        var bindings = domBindings({
            'model': {
                type: 'value',
                selector: '.thing'
            }
        });

        t.equal(el.firstChild.value, '');
        bindings.run('model', null, el, 'hello');
        t.equal(el.firstChild.value, 'hello');

        bindings.run('model', null, el, 'string');
        t.equal(el.firstChild.value, 'string');

        bindings.run('model', null, el, void 0);
        t.equal(el.firstChild.value, '');

        bindings.run('model', null, el, null);
        t.equal(el.firstChild.value, '');

        bindings.run('model', null, el, NaN);
        t.equal(el.firstChild.value, '');
    });

    t.end();
});

/*
### booleanClass

add/removes class based on boolean interpretation of property name.

```js
'model.active': {
    type: 'booleanClass',
    selector: '#something', // or role
    // to specify name of class to toggle (if different than key name)
    // you could either specify a name
    name: 'active'
    // or a yes/no case
    yes: 'active',
    no: 'not-active'
}
```
*/


test('booleanClass bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" role="some-role">');
    var bindings = domBindings({
        'model': {
            type: 'booleanClass',
            selector: '.thing',
            name: 'awesome'
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'awesome'));
    bindings.run('', null, el, true);

    t.ok(dom.hasClass(el.firstChild, 'awesome'));
    bindings.run('', null, el, false);

    t.notOk(dom.hasClass(el.firstChild, 'awesome'));

    t.end();
});

test('booleanAttribute bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" role="some-role">');
    var bindings = domBindings({
        'model': {
            type: 'booleanAttribute',
            selector: '.thing',
            name: 'checked'
        }
    });

    t.notOk(el.firstChild.checked, 'should not be checked to start');

    bindings.run('', null, el, true, 'checked');
    t.ok(el.firstChild.checked, 'should checked');

    bindings.run('', null, el, false, 'checked');
    t.notOk(el.firstChild.checked, 'should not be checked');

    t.end();
});

test('innerHTML bindings', function (t) {
    var el = getEl();
    var bindings = domBindings({
        'model': {
            type: 'innerHTML',
            selector: ''
        }
    });

    t.notOk(el.innerHTML, 'should be empty to start');

    bindings.run('', null, el, '<span></span>');
    t.equal(el.innerHTML, '<span></span>', 'should hav a span now');

    bindings.run('', null, el, '');
    t.notOk(el.innerHTML, 'should be empty again');

    t.end();
});

// TODO: tests for toggle

// TODO: tests for switch

// TODO: tests for multiple bindings in one declaration



