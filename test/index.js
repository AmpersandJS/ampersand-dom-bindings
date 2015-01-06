var test = require('tape');
var domBindings = require('../ampersand-dom-bindings');
var dom = require('ampersand-dom');


function getEl(html) {
    var div = document.createElement('div');
    if (html) div.innerHTML = html;
    return div;
}


test('text bindings', function (t) {
    var el = getEl('<span class="thing" data-hook="hello"></span>');
    var bindings = domBindings({
        'model1': {
            type: 'text',
            selector: '.thing'
        },
        'model2': '.thing',
        'model3': {
            type: 'text',
            hook: 'hello'
        }
    });
    t.notEqual(el.firstChild.textContent, 'hello');
    bindings.run('model1', null, el, 'hello');
    t.equal(el.innerHTML, '<span class="thing" data-hook="hello">hello</span>');

    bindings.run('model2', null, el, 'string');
    t.equal(el.innerHTML, '<span class="thing" data-hook="hello">string</span>');

    bindings.run('model3', null, el, 'third');
    t.equal(el.innerHTML, '<span class="thing" data-hook="hello">third</span>');

    t.end();
});

test('class bindings', function (t) {
    var el = getEl('<span class="thing" data-hook="some-hook"></span>');
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
    var el = getEl('<span class="thing" data-hook="some-hook"></span>');
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

test('attribute array bindings', function (t) {
    var el = getEl('<span class="thing" data-hook="some-hook"></span>');
    var bindings = domBindings({
        'model': {
            type: 'attribute',
            selector: '.thing',
            name: ['height', 'width']
        }
    });

    t.equal(el.firstChild.getAttribute('height'), null);
    t.equal(el.firstChild.getAttribute('width'), null);

    bindings.run('model', null, el, '100');
    t.equal(el.firstChild.getAttribute('height'), '100');
    t.equal(el.firstChild.getAttribute('width'), '100');

    bindings.run('model', null, el, '200');
    t.equal(el.firstChild.getAttribute('height'), '200');
    t.equal(el.firstChild.getAttribute('width'), '200');

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

test('value bindings', function (t) {
    var input = getEl('<input class="thing" type="text">');
    var select = getEl('<select class="thing"><option value=""></option><option value="hello"></option><option value="string"></option></select>');
    var textarea = getEl('<textarea class="thing"></textarea>');

    [input, select, textarea].forEach(function (el) {
        document.body.appendChild(el);
        el.firstChild.focus();

        var bindings = domBindings({
            'model': {
                type: 'value',
                selector: '.thing'
            }
        });

        t.equal(el.firstChild.value, '');

        bindings.run('model', null, el, 'hello');
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
    selector: '#something', // or hook
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
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
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

test('booleanClass yes/no bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
    var bindings = domBindings({
        'model': {
            type: 'booleanClass',
            selector: '.thing',
            yes: 'awesome',
            no: 'not-awesome'
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'awesome'), 'should not start with yes class');
    t.notOk(dom.hasClass(el.firstChild, 'not-awesome'), 'should not start with no class');

    bindings.run('', null, el, true);
    t.ok(dom.hasClass(el.firstChild, 'awesome'), 'should have yes class');
    t.notOk(dom.hasClass(el.firstChild, 'not-awesome'), 'should not have no class');

    bindings.run('', null, el, false);
    t.notOk(dom.hasClass(el.firstChild, 'awesome'), 'should not have yes class');
    t.ok(dom.hasClass(el.firstChild, 'not-awesome'), 'should have no class');

    t.end();
});

test('booleanClass array bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
    var bindings = domBindings({
        'model': {
            type: 'booleanClass',
            selector: '.thing',
            name: ['class1', 'class2']
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'class1'));
    t.notOk(dom.hasClass(el.firstChild, 'class2'));

    bindings.run('', null, el, true);
    t.ok(dom.hasClass(el.firstChild, 'class1'));
    t.ok(dom.hasClass(el.firstChild, 'class2'));

    bindings.run('', null, el, false);
    t.notOk(dom.hasClass(el.firstChild, 'class1'));
    t.notOk(dom.hasClass(el.firstChild, 'class2'));

    t.end();
});

test('booleanClass yes/no array bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
    var bindings = domBindings({
        'model': {
            type: 'booleanClass',
            selector: '.thing',
            yes: ['awesome', 'very-awesome', 'super-awesome'],
            no: ['not-awesome', 'very-not-awesome']
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'awesome'), 'should not start with yes class');
    t.notOk(dom.hasClass(el.firstChild, 'very-awesome'), 'should not start with no class');
    t.notOk(dom.hasClass(el.firstChild, 'super-awesome'), 'should not start with no class');
    t.notOk(dom.hasClass(el.firstChild, 'not-awesome'), 'should not start with yes class');
    t.notOk(dom.hasClass(el.firstChild, 'very-not-awesome'), 'should not start with no class');

    bindings.run('', null, el, true);
    t.ok(dom.hasClass(el.firstChild, 'awesome'), 'should have yes class');
    t.ok(dom.hasClass(el.firstChild, 'very-awesome'), 'should have yes class');
    t.ok(dom.hasClass(el.firstChild, 'super-awesome'), 'should have yes class');
    t.notOk(dom.hasClass(el.firstChild, 'not-awesome'), 'should not have no class');
    t.notOk(dom.hasClass(el.firstChild, 'very-not-awesome'), 'should not have no class');

    bindings.run('', null, el, false);
    t.notOk(dom.hasClass(el.firstChild, 'awesome'), 'should not have yes class');
    t.notOk(dom.hasClass(el.firstChild, 'very-awesome'), 'should not have yes class');
    t.notOk(dom.hasClass(el.firstChild, 'super-awesome'), 'should not have yes class');
    t.ok(dom.hasClass(el.firstChild, 'not-awesome'), 'should have no class');
    t.ok(dom.hasClass(el.firstChild, 'very-not-awesome'), 'should have no class');

    t.end();
});

test('booleanAttribute bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
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

test('booleanAttribute array bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
    var bindings = domBindings({
        'model': {
            type: 'booleanAttribute',
            selector: '.thing',
            name: ['disabled', 'readOnly']
        }
    });

    t.notOk(el.firstChild.disabled, 'should not be disabled to start');
    t.notOk(el.firstChild.readOnly, 'should not be readOnly to start');

    bindings.run('', null, el, true, 'disabled, readOnly');
    t.ok(el.firstChild.disabled, 'should disabled');
    t.ok(el.firstChild.readOnly, 'should readOnly');

    bindings.run('', null, el, false, 'disabled, readOnly');
    t.notOk(el.firstChild.disabled, 'should not be disabled');
    t.notOk(el.firstChild.readOnly, 'should not be readOnly');

    t.end();
});

test('booleanAttribute yes/no bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
    var bindings = domBindings({
        'model': {
            type: 'booleanAttribute',
            selector: '.thing',
            yes: 'awesome',
            no: 'not-awesome'
        }
    });

    t.notOk(el.firstChild.hasAttribute('awesome'), 'should not start with yes attribute');
    t.notOk(el.firstChild.hasAttribute('not-awesome'), 'should not start with no attribute');

    bindings.run('', null, el, true);
    t.ok(el.firstChild.hasAttribute('awesome'), 'should have yes attribute');
    t.notOk(el.firstChild.hasAttribute('not-awesome'), 'should not have no attribute');

    bindings.run('', null, el, false);
    t.notOk(el.firstChild.hasAttribute('awesome'), 'should not have yes attribute');
    t.ok(el.firstChild.hasAttribute('not-awesome'), 'should have no attribute');

    t.end();
});

test('booleanAttribute yes/no array bindings', function (t) {
    var el = getEl('<input type="checkbox" class="thing" data-hook="some-hook">');
    var bindings = domBindings({
        'model': {
            type: 'booleanAttribute',
            selector: '.thing',
            yes: ['awesome', 'very-awesome', 'super-awesome'],
            no: ['not-awesome', 'very-not-awesome']
        }
    });

    t.notOk(el.firstChild.hasAttribute('awesome'), 'should not start with yes attribute');
    t.notOk(el.firstChild.hasAttribute('very-awesome'), 'should not start with no attribute');
    t.notOk(el.firstChild.hasAttribute('super-awesome'), 'should not start with no attribute');
    t.notOk(el.firstChild.hasAttribute('not-awesome'), 'should not start with yes attribute');
    t.notOk(el.firstChild.hasAttribute('very-not-awesome'), 'should not start with no attribute');

    bindings.run('', null, el, true);
    t.ok(el.firstChild.hasAttribute('awesome'), 'should have yes attribute');
    t.ok(el.firstChild.hasAttribute('very-awesome'), 'should have yes attribute');
    t.ok(el.firstChild.hasAttribute('super-awesome'), 'should have yes attribute');
    t.notOk(el.firstChild.hasAttribute('not-awesome'), 'should not have no attribute');
    t.notOk(el.firstChild.hasAttribute('very-not-awesome'), 'should not have no attribute');

    bindings.run('', null, el, false);
    t.notOk(el.firstChild.hasAttribute('awesome'), 'should not have yes attribute');
    t.notOk(el.firstChild.hasAttribute('very-awesome'), 'should not have yes attribute');
    t.notOk(el.firstChild.hasAttribute('super-awesome'), 'should not have yes attribute');
    t.ok(el.firstChild.hasAttribute('not-awesome'), 'should have no attribute');
    t.ok(el.firstChild.hasAttribute('very-not-awesome'), 'should have no attribute');

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

test('switchClass bindings', function (t) {
    var el = getEl('<div class="foo"></div><div class="bar"></div>');
    var bindings = domBindings({
        'model': {
            type: 'switchClass',
            name: 'yes',
            cases: {
                foo: '.foo',
                bar: '.bar'
            }
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'yes'), '.foo should have no extra class to start');
    t.notOk(dom.hasClass(el.lastChild, 'yes'), '.bar should have no extra class to start');

    bindings.run('', null, el, 'foo');
    t.ok(dom.hasClass(el.firstChild, 'yes'), '.foo should now have `yes` class');
    t.notOk(dom.hasClass(el.lastChild, 'yes'), '.bar should still have no extra class');

    bindings.run('', null, el, 'bar');
    t.ok(dom.hasClass(el.lastChild, 'yes'), '.bar should now have `yes` class');
    t.notOk(dom.hasClass(el.firstChild, 'yes'), '.foo should now have no extra class');

    t.end();
});

test('ensure selector matches root element', function (t) {
    var el = getEl();
    var bindings = domBindings({
        'model': {
            type: 'innerHTML',
            selector: 'div' //select the root element
        }
    });

    t.notOk(el.innerHTML, 'should be empty to start');

    bindings.run('', null, el, '<span></span>');
    t.equal(el.innerHTML, '<span></span>', 'should hav a span now');

    bindings.run('', null, el, '');
    t.notOk(el.innerHTML, 'should be empty again');

    t.end();
});

test('ensure commas work in selectors', function (t) {
    var el = getEl('<span class="thing"></span><span class="another-thing"></span>');
    var bindings = domBindings({
        'model': {
            type: 'class',
            selector: '.thing, .another-thing'
        }
    });

    t.notOk(dom.hasClass(el.firstChild, 'hello'));
    t.notOk(dom.hasClass(el.lastChild, 'hello'));

    bindings.run('model', null, el, 'hello');
    t.ok(dom.hasClass(el.firstChild, 'hello'));
    t.ok(dom.hasClass(el.lastChild, 'hello'));

    bindings.run('model', null, el, 'string');
    t.ok(dom.hasClass(el.firstChild, 'string'));
    t.ok(dom.hasClass(el.lastChild, 'string'));
    t.notOk(dom.hasClass(el.firstChild, 'hello'));
    t.notOk(dom.hasClass(el.lastChild, 'hello'));

    t.end();
});

test('selector will find root *and* children', function (t) {
    var el = getEl('<div></div><div></div>');
    var bindings = domBindings({
        'model': {
            type: 'class',
            selector: 'div' // Root and children are all divs
        }
    });

    t.notOk(dom.hasClass(el, 'hello'));
    t.notOk(dom.hasClass(el.firstChild, 'hello'));
    t.notOk(dom.hasClass(el.lastChild, 'hello'));

    bindings.run('model', null, el, 'hello');
    t.ok(dom.hasClass(el, 'hello'));
    t.ok(dom.hasClass(el.firstChild, 'hello'));
    t.ok(dom.hasClass(el.lastChild, 'hello'));

    t.end();
});


// Custom bindings
test('custom binding', function (t) {
    var el = getEl('<span class="thing"></span>');
    var custom = function (bindingEl, value, previous) {
        var msg = value + ' is the new value.';
        msg += typeof previous !== 'undefined' ? ' previous value was ' + previous + '.' : '';
        dom.text(bindingEl, msg);
    };
    var bindings = domBindings({
        'model': {
            type: custom,
            selector: '.thing'
        }
    });

    t.equal(el.firstChild.textContent, '');

    bindings.run('model', null, el, 'hello');
    t.equal(el.firstChild.textContent, 'hello is the new value.');

    bindings.run('model', null, el, 'goodbye');
    t.equal(el.firstChild.textContent, 'goodbye is the new value. previous value was hello.');

    bindings.run('model', null, el, '');
    t.equal(el.firstChild.textContent, ' is the new value. previous value was goodbye.');

    bindings.run('model', null, el, 'goodbye');
    t.equal(el.firstChild.textContent, 'goodbye is the new value. previous value was .');

    t.end();
});

test('custom binding with context', function (t) {
    var el = getEl('<span class="thing"></span>');
    var custom = function (bindingEl) {
        dom.text(bindingEl, 'this.value was ' + this.value);
    };
    var bindings = domBindings({
        'model': {
            type: custom,
            selector: '.thing'
        }
    }, { value: 'goodbye' });

    bindings.run('model', null, el, 'hello');
    t.equal(el.firstChild.textContent, 'this.value was goodbye');

    t.end();
});

//Bad type is an error
test('Errors on a bad type', function (t) {
    function bindings(type) {
        return function () {
            domBindings({
                'model': {
                    type: type,
                    selector: '.thing'
                }
            });
        };
    }
    function errMsg(msg) {
        return new RegExp(('no such binding type: ' + msg).replace(/[\[\]]/g, '\\$&'));
    }

    t.throws(bindings('not-a-type'), errMsg('not-a-type'));
    t.throws(bindings({}), errMsg({}));
    t.throws(bindings([]), errMsg([]));

    t.end();
});

test('basic toggle', function (t) {
    var el = getEl('<span></span>');
    var bindings = domBindings({
        'model1': {
            type: 'toggle',
            selector: 'span'
        }
    });

    var span = el.children[0];
    t.equal(span.style.display, '', 'base case');

    bindings.run('model1', null, el, true);
    t.equal(span.style.display, '', 'base case');

    bindings.run('model1', null, el, false);
    t.equal(span.style.display, 'none', 'should now be hidden');

    bindings.run('model1', null, el, true);
    t.equal(span.style.display, '', 'should now be visible');

    t.end();
});

test('toggle with yes/no', function (t) {
    var el = getEl('<span class="one"></span><span class="two"></span>');
    var bindings = domBindings({
        'model1': {
            type: 'toggle',
            no: '.one',
            yes: '.two'
        }
    });

    var one = el.children[0];
    var two = el.children[1];

    t.equal(one.style.display, '', 'base case');
    t.equal(two.style.display, '', 'base case');

    bindings.run('model1', null, el, true);

    t.equal(one.style.display, 'none', 'one should be hidden');
    t.equal(two.style.display, '', 'two should be visible');

    bindings.run('model1', null, el, false);

    t.equal(one.style.display, '', 'one should be visible');
    t.equal(two.style.display, 'none', 'two should be hidden');

    bindings.run('model1', null, el, 'something truthy');

    t.equal(one.style.display, 'none', 'one should be hidden');
    t.equal(two.style.display, '', 'two should be visible');

    // here we'll try a bunch of variations of falsy things
    // empty string
    bindings.run('model1', null, el, true);
    t.equal(one.style.display, 'none', 'one should be hidden');
    t.equal(two.style.display, '', 'two should be visible');
    bindings.run('model1', null, el, '');
    t.equal(one.style.display, '', 'one should be visible');
    t.equal(two.style.display, 'none', 'two should be hidden');

    // null
    bindings.run('model1', null, el, true);
    t.equal(one.style.display, 'none', 'one should be hidden');
    t.equal(two.style.display, '', 'two should be visible');
    bindings.run('model1', null, el, null);
    t.equal(one.style.display, '', 'one should be visible');
    t.equal(two.style.display, 'none', 'two should be hidden');

    // undefined
    bindings.run('model1', null, el, true);
    t.equal(one.style.display, 'none', 'one should be hidden');
    t.equal(two.style.display, '', 'two should be visible');
    bindings.run('model1', null, el, undefined);
    t.equal(one.style.display, '', 'one should be visible');
    t.equal(two.style.display, 'none', 'two should be hidden');

    // zero
    bindings.run('model1', null, el, true);
    t.equal(one.style.display, 'none', 'one should be hidden');
    t.equal(two.style.display, '', 'two should be visible');
    bindings.run('model1', null, el, 0);
    t.equal(one.style.display, '', 'one should be visible');
    t.equal(two.style.display, 'none', 'two should be hidden');

    t.end();
});

// TODO: tests for switch
test('switch', function (t) {
    var el = getEl('<div class="foo"></div><div class="bar"></div><div class="baz"></div>');
    var bindings = domBindings({
        'model': {
            type: 'switch',
            name: 'yes',
            cases: {
                foo: '.foo',
                bar: '.bar',
                baz: '.baz'
            }
        }
    });

    var foo = el.children[0];
    var bar = el.children[1];
    var baz = el.children[2];

    t.equal(foo.style.display, '', 'base case');
    t.equal(bar.style.display, '', 'base case');
    t.equal(baz.style.display, '', 'base case');

    bindings.run('', null, el, 'foo');

    t.equal(foo.style.display, '', 'show foo');
    t.equal(bar.style.display, 'none');
    t.equal(baz.style.display, 'none');

    bindings.run('', null, el, 'bar');

    t.equal(foo.style.display, 'none');
    t.equal(bar.style.display, '', 'show bar');
    t.equal(baz.style.display, 'none');

    bindings.run('', null, el, 'baz');

    t.equal(foo.style.display, 'none');
    t.equal(bar.style.display, 'none');
    t.equal(baz.style.display, '', 'show baz');

    bindings.run('', null, el, 'something else');

    t.equal(foo.style.display, 'none');
    t.equal(bar.style.display, 'none');
    t.equal(baz.style.display, 'none');

    t.end();
});

// TODO: tests for multiple bindings in one declaration

test('Issue #20, Ensure support for space-separated `data-hook`s', function (t) {
    var el = getEl('<span class="thing" data-hook="hello other"></span>');
    var bindings = domBindings({
        'model1': {
            type: 'text',
            hook: 'other'
        }
    });

    bindings.run('model1', null, el, 'first');
    t.equal(el.firstChild.textContent, 'first');

    bindings.run('model1', null, el, 'second');
    t.equal(el.firstChild.innerHTML, 'second');

    t.end();
});


test('handle yes/no cases for `booleanClass` when missing `yes` or `no`', function (t) {
    var el = getEl('<span></span>');

    var bindings = domBindings({
        'model1': {
            type: 'booleanClass',
            no: 'no',
            selector: 'span'
        }
    });

    t.equal(el.firstChild.className, '');
    bindings.run('model1', null, el, false);
    t.equal(el.firstChild.className, 'no');
    bindings.run('model1', null, el, true);
    t.equal(el.firstChild.className, '');

    el = getEl('<span></span>');

    bindings = domBindings({
        'model1': {
            type: 'booleanClass',
            yes: 'yes',
            selector: 'span'
        }
    });

    t.equal(el.firstChild.className, '');
    bindings.run('model1', null, el, true);
    t.equal(el.firstChild.className, 'yes');
    bindings.run('model1', null, el, false);
    t.equal(el.firstChild.className, '');

    t.end();
});

test('handle yes/no cases for `booleanAttribute` when missing `yes` or `no`', function (t) {
    var el = getEl('<span></span>');

    var bindings = domBindings({
        'model1': {
            type: 'booleanAttribute',
            no: 'no',
            selector: 'span'
        }
    });

    t.notOk(el.firstChild.hasAttribute('no'));
    bindings.run('model1', null, el, false);
    t.ok(el.firstChild.hasAttribute('no'));
    bindings.run('model1', null, el, true);
    t.notOk(el.firstChild.hasAttribute('no'));

    el = getEl('<span></span>');

    bindings = domBindings({
        'model1': {
            type: 'booleanAttribute',
            yes: 'yes',
            selector: 'span'
        }
    });

    t.notOk(el.firstChild.hasAttribute('yes'));
    bindings.run('model1', null, el, true);
    t.ok(el.firstChild.hasAttribute('yes'));
    bindings.run('model1', null, el, false);
    t.notOk(el.firstChild.hasAttribute('yes'));

    t.end();
});

test('handle yes/no cases for `toggle` when missing `yes` or `no`', function (t) {
    var el = getEl('<span></span>');

    var bindings = domBindings({
        'model1': {
            type: 'toggle',
            no: 'span'
        }
    });

    t.equal(el.firstChild.style.display, '', 'base case');
    bindings.run('model1', null, el, false);
    t.equal(el.firstChild.style.display, '', 'should show when false');
    bindings.run('model1', null, el, true);
    t.equal(el.firstChild.style.display, 'none', 'should hide when true');

    el = getEl('<span></span>');

    bindings = domBindings({
        'model1': {
            type: 'toggle',
            yes: 'span'
        }
    });

    t.equal(el.firstChild.style.display, '', 'base case');
    bindings.run('model1', null, el, true, '');
    t.equal(el.firstChild.style.display, '', 'should show when true');
    bindings.run('model1', null, el, false);
    t.equal(el.firstChild.style.display, 'none', 'should hide when false');

    t.end();
});
