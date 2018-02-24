var dom = require('ampersand-dom');
var matchesSelector = require('matches-selector');
var slice = Array.prototype.slice;

exports.getMatches = function getMatches(el, selector, firstOnly) {
    if (selector === '') return [el];
    var matches = [];
    if (!selector) return matches;
    if (firstOnly) {
        if (matchesSelector(el, selector)) return [el];
        return el.querySelector(selector) ? [el.querySelector(selector)] : [];
    } else {
        if (matchesSelector(el, selector)) matches.push(el);
        return matches.concat(slice.call(el.querySelectorAll(selector)));
    }
};

exports.setAttributes = function setAttributes(el, attrs) {
    for (var name in attrs) {
        dom.setAttribute(el, name, attrs[name]);
    }
};

exports.removeAttributes = function removeAttributes(el, attrs) {
    for (var name in attrs) {
        dom.removeAttribute(el, name);
    }
};