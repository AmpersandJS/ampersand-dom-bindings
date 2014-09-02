# ampersand-dom-bindings

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

Takes binding declarations as described below and returns [key-tree-store](https://github.com/HenrikJoreteg/key-tree-store) of functions that can be used to apply those bindings to a DOM tree.

[ampersand-view](http://ampersandjs.com/docs#ampersand-view) use this for declarative bindings.

The returned functions should be called with these arguments: The root element, the current value of the property, and a name for the binding types where that is relevant.

## install

```
npm install ampersand-dom-bindings
```

## Binding types

### text

sets/maintains `textContent` of selected element. treats `undefined`, `null`, and `NaN` as `''`

```js
'model.key': {
    type: 'text',
    selector: '.someSelector' // or hook
}
```

### class

sets and maintains single class as string that matches value of property
- handles removing previous class if there was one
- treats `undefined`, `null`, and `NaN` as `''` (empty string).

```js
'model.key': {
    type: 'class',
    selector: // or hook
}
```

### attribute 
sets the whole attribute to match value of property. treats `undefined`, `null`, and `NaN` as `''` (empty string). `name` can also be an array to set multiple attributes to the same value.
    
```js
'model.key': {
    type: 'attribute',
    selector: '#something', // or hook
    name: 'width'
}
```

### value

sets the value of the element to match value of the property. works well for `input`, `select`, and `textarea` elements. treats `undefined`, `null`, and `NaN` as `''` (empty string).

**note**: The binding will only be applied if the element is not currently in focus. This is done by checking to see if the element is the `document.activeElement` first.
    
```js
'model.key': {
    type: 'value',
    selector: '#something', // or hook
}
```

### booleanClass

add/removes class based on boolean interpretation of property name. `name`, `yes`, or `no` can also be an array of class names where all the values will be toggled.

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

### booleanAttribute

toggles whole attribute on the element (think `checked`) based on boolean interpretation of property name. `name` can also be an array of attribute names where all the values will be toggled.

```js
'model.isAwesome': {
    type: 'booleanAttribute',
    selector: '#something', // or hook
    name: 'checked'
}
```

### toggle

toggles existance of entire element (uses a comment node as placeholder if gone) based on boolean interpretation of property name.

```js
// simple show/hide of single element
'model.key': {
    type: 'toggle',
    selector: '#something' // or hook
}

// show/hide where true/false show different things
'model.key': {
    type: 'toggle',
    yes: '#true_case',
    no: '#false_case'
}
```

### switch

Toggles existance of multiple items based on value of property.

```js
'model.activetab': {
    type: 'switch',
    cases: {
        'edit': '#edit_tab',
        'new': '#new_tab',
        'details': '#details_tab'
    }
}
```

### innerHTML

renders innerHTML, can be a string or DOM, based on property value of model

```js
'model.key': {
    type: 'innerHTML',
    selector: '#something' // or hook
}
```

## Handling multiple bindings for a given key

If given an array, then treat each contained item as separate binding

```js
'model.key': [
    {
        type: 'booleanClass',
        selector: '#something', // or hook
        name: 'active' // (optional) name of class to toggle if different than key name
    },
    {
        type: 'attribute',
        selector: '#something', // or hook
        name: 'width'
    }
]
```

The `attribute`, `booleanAttribute` and `booleanClass` types also accept an array for the `name` property (and `yes`/`no` for `booleanClass`). All the values in the array will be set the same as if each were bound separately.

```js
'model.key': {
    // Also works with booleanAttribute and booleanClass
    type: 'attribute',
    selector: '#avatar',
    // Both height and width will be bound to model.key
    name: ['height', 'width']
}
```


## binding using `data-hook` attribute

We've started using this convention a lot, rather than using classes and IDs in JS to select elements within a view, we use the `data-hook` attribute. This lets designers edit templates without fear of breaking something by changing a class. It works wonderfully, but the only thing that sucks about that is the syntax of attribute selectors: `[data-hook=some-hook]` is a bit annoying to type a million types, and also in JS-land when coding and we see `[` we always assume arrays.

So for each of these bindings you can either use `selector` or `hook`, so these two would be equivalent:

```js
'model.key': {
    selector: '[data-hook=my-element]'
}

'model.key': {
    hook: 'my-element'
}

```

## handling simplest cases: text

```js
'model.key': '#something' // creates `text` binding for that selector and property

// `type` defaults to `text` so we can also do
'model.key': {
    hook: 'hook-name'
}
```


## real life example

```js
var View = require('ampersand-view');
var templates = require('../templates');


module.exports = View.extend({
    template: templates.includes.app,
    bindings: {
        'model.client_name': {
            hook: 'name'
        },
        'model.logo_uri': {
            type: 'attribute',
            name: 'src',
            hook: 'icon'
        }
    }
});
```

## other benefits

Previously after having given views the ability to have their own properties (since view inherits from state) it was awkward to bind those to the DOM. Also, for binding things that were not just `this.model` the syntax had to change. 

Now this is fairly simple/obvious:

```js
module.exports = View.extend({
    template: templates.includes.app,
    props: {
        activetab: 'string',
        person: 'state',
        meeting: 'state'
    },
    bindings: {
        // for the property that's directly on the view
        'activetab': {
            type: 'switch',
            case: {
                'edit': '#edit_tab',
                'new': '#new_tab',
                'details': '#details_tab'
            }
        },
        // this one is for one model
        'person.full_name': '[data-hook=name]',
        // this one is for another model
        'meeting.subject': '[data-hook=subject]'
    }
});
```

## license

MIT
