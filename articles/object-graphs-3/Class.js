// Reimplementation of rb_include_module() from Ruby 1.9
function includeModule(klass, module) {
  Object.getOwnPropertyNames(module).forEach(function (name) {
    Object.defineProperty(klass, name, Object.getPropertyDescriptor(module, name));
  });
  return klass;
}

// Reimplementation of rb_singleton_class() from Ruby 1.9
function singletonClass(obj) {
  var singleton = obj.__proto__;
  if (!singleton.__singleton__) {
    singleton = {};
    Object.defineProperty(singleton, {__singleton__: {value: true}});
    singleton.__proto__ = obj.__proto__;
    obj.__proto__ = singleton;
  }
  return singleton;
}

// Port of rb_extend_object() from Ruby 1.9
function extendObject(obj, module) {
  return includeModule(singletonClass(obj), module);
}

function isClass(klass) {
  return typeof klass === 'function'
      && klass.hasOwnProperty('prototype')
      && klass.prototype.hasOwnProperty('constructor')
      && klass.prototype.constructor === klass;
}

module.exports = {
  name: "Class",
  // Dummy no-op initialize
  initialize: function initialize() {},
  // Create a new instance, but call the initializer if it exists
  new: function _new() {
    var obj = this.allocate();
    obj.initialize.apply(obj, arguments);
    return obj;
  },
  // Create a new instance, but skip initialize
  allocate: function allocate() {
    var obj = {};
    obj.__proto__ = this;
    return obj;
  },
  // This is to create a subclass, we don't have the < syntax like ruby
  extend: function extend(name, child) {
    child.__proto__ = this;
    child.name = name;
    return child;
  },
  // Make a shallow copy of some other object and insert it in the inheritance chain
  mixin: function include(other) {
    var props = {};
    Object.getOwnPropertyNames(other).forEach(function (key) {
      props[key] = Object.getOwnPropertyDescriptor(other, key);
    });
    var shim = Object.create(this.__proto__, props);
    this.__proto__ = shim;
    return this;
  },
  get ancestors(useRaw) {
    var parents = [];
    var current = this;
    while (current = current.__proto__) {
      if (useRaw) {
        parents.push(current);
      } else {
        parents.push(current.name || current.constructor.name);
      }
    }
    return parents;
  }
};
