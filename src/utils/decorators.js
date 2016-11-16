/**
 * @credit http://benmccormick.org/2015/07/06/backbone-and-es6-classes-revisited/
 * @credit https://gist.github.com/StevenLangbroek/6bd28d8201839434b843
 */

import _ from 'underscore';
import debug from 'debug/browser';

const log = debug('random-gift:util:decorator');

export function model(value) {
  return function decorator(target) {
    target.prototype.model = value;
  }
}

export function tagName(value) {
  return function decorator(target) {
    target.prototype.tagName = value;
  }
}

export function template(value, refName) {
  return function decorator(target) {
    const options = {};

    if (refName && typeof refName === 'string') {
      options.variable = refName;
      log('refName: %s', refName, value);
    }

    target.prototype.template = _.template(value, options);
  }
}

export function on(eventName){
  return function(target, name, descriptor){
    if (!target.events) {
      target.events = {};
    }
    if (_.isFunction(target.events)) {
      throw new Error('The on decorator is not compatible with an events method');
    }
    if (!eventName) {
      throw new Error('The on decorator requires an eventName argument');
    }
    target.events[eventName] = name;
    return descriptor;
  }
}

export function throttle(throttleMs) {
  return function(target, name, descriptor){
    if (!throttleMs) {
      throw new Error('The on decorator requires an throttleMs argument');
    }

    descriptor.value = _.throttle(descriptor.value, throttleMs);
    console.log(target[name], descriptor);
    return descriptor;
  }
}

export function ui(key, selector){
  return function decorator(target){
    if (!target.prototype._ui) {
      target.prototype._ui = {};
    }

    if (!key) {
      throw new Error('The ui decorator requires a key argument');
    }

    if (!selector) {
      throw new Error('The ui decorator requires a selector argument');
    }

    target.prototype._ui[key] = selector;
  }
}
