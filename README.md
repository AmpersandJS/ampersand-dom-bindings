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
    selector: '.someSelector' // or role
}
```

### class

sets and maintains single class as string that matches value of property
- handles removing previous class if there was one
- treats `undefined`, `null`, and `NaN` as `''` (empty string).

```js
'model.key': {
    type: 'class',
    selector: // or role
}
```

### attribute 
sets the whole attribute to match value of property. treats `undefined`, `null`, and `NaN` as `''` (empty string).
    
```js
'model.key': {
    type: 'attribute',
    selector: '#something', // or role
    name: 'width'
}
```

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

### booleanAttribute

toggles whole attribute on the element (think `checked`) based on boolean interpretation of property name.

```js
'model.isAwesome': {
    type: 'booleanAttribute',
    selector: '#something', // or role
    name: 'checked'
}
```

### toggle

toggles existance of entire element (uses a comment node as placeholder if gone) based on boolean interpretation of property name.

```js
// simple show/hide of single element
'model.key': {
    type: 'toggle',
    selector: '#something' // or role
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


## Handling multiple bindings for a given key

If given an array, then treat each contained item as separate binding

```js
'model.key': [
    {
        type: 'booleanClass',
        selector: '#something', // or role
        name: 'active' // (optional) name of class to toggle if different than key name
    },
    {
        type: 'attribute',
        selector: '#something', // or role
        name: 'width'
    }
]
```

## binding using `role` attribute

We've started using this convention a lot, rather than using classes and IDs in JS to select elements within a view, we use the `role` attribute. This lets designers edit templates without fear of breaking something by changing a class. It works wonderfully, but the only thing that sucks about that is the syntax of attribute selectors: `[role=some-role]` is a bit annoying to type a million types, and also in JS-land when coding and we see `[` we always assume arrays.

I'm proposing that for each of these bindings you can either use `selector` or `role`, so these two would be equivalent:

```js
'model.key': {
    selector: '[role=my-element]'
}

'model.key': {
    role: 'my-element'
}

```

## handling simplest cases: text

```js
'model.key': '#something' // creates `text` binding for that selector and property

// `type` defaults to `text` so we can also do
'model.key': {
    role: 'role-name'
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
            role: 'name'
        },
        'model.logo_uri': {
            type: 'attribute',
            name: 'src',
            role: 'icon'
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
        'person.full_name': '[role=name]',
        // this one is for another model
        'meeting.subject': '[role=subject]'
    }
});
```

## license

MIT
