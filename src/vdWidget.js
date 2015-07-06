(function(factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('underscore'));
    } else if (typeof define === 'function' && define.amd) {
        define(['underscore'], factory);
    } else {
        this.VdWidget = factory(_);
    }
})(function(_) {
    /**
     * inherit
     * @param Parent
     * @param prototype
     * @returns {Function}
     */
    var inherit = function(Parent, prototype) {
        var Child = function() {
            Parent.apply(this, arguments);
        };

        Child.prototype = _.create(Parent.prototype);
        _.each(prototype, function(proto, name) {
            if (!_.isFunction(proto)) {
                return Child.prototype[name] = proto;
            }
            Child.prototype[name] = (function() {
                var _super = function() {
                        return Parent.prototype[name].apply(this, arguments);
                    },
                    _superApply = function(args) {
                        return Parent.prototype[name].apply(this, args);
                    };
                return function() {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;

                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = proto.apply(this, arguments);

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                }
            })()
        });
        Child.__super = Parent.prototype;
        Child.prototype.constructor = Child;

        _.extend(Child, Parent);

        return Child;
    };

    var VdWidget = function(attributes) {
        var attrs = attributes || {};
        attrs = _.extend({
            children: null
        }, _.result(this, 'defaults'), attrs);

        this._events = {};
        this.attributes = {};

        this.vdt = Vdt(this.template);
        this.set(attrs, {silent: true});

        this.widgets = {};

        this.rendered = false;

        var ret = this._init();
        // support promise
        if (ret && ret.then) {
            ret.then(_.bind(this._render, this))
        } else {
            this._render();
        }
    };

    VdWidget.prototype = {
        constructor: VdWidget,

        type: 'Widget',

        _init: function() {},

        _render: function() {
            this.element = this.vdt.render(this);

            this.on('change', function() {
                this.update();
            });

            this.rendered = true;
            this.trigger('rendered', this);
        },

        _create: function() {},

        _update: function() {},

        init: function() {
            this._create();
            return this.element;
        },

        update: function(previous, domNode) {
            if (previous && domNode) {
                this.vdt.setNode(domNode);
                this.vdt.setTree(previous.vdt.getTree());
            }
            this.element = this.vdt.update(this);
            this._update();
            return this.element;
        },

        destroy: function(domNode) {},

        get: function(attr) {
            return arguments.length === 0 ? this.attributes : this.attributes[attr];
        },

        set: function(key, val, options) {
            if (key == null) return this;

            var attrs;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options || (options = {});

            var current = this.attributes,
                changes = [];

            for (var attr in attrs) {
                val = attrs[attr];
                if (!_.isEqual(current[attr], val)) {
                    changes.push(attr);
                }
                current[attr] = val;
            }

            if (!options.silent && changes.length) {
                for (var i = 0, l = changes.length; i < l; i++) {
                    this.trigger('change:' + changes[i], this, current[changes[i]]);
                }

                this.trigger('change', this);
            }

            return this;
        },

        on: function(name, callback) {
            (this._events[name] || (this._events[name] = [])).push(callback);

            return this;
        },

        off: function(name, callback) {
            if (!arguments.length) {
                this._events = {};
                return this;
            }

            var callbacks = this._events[name];
            if (!callbacks) return this;

            if (arguments.length === 1) {
                delete this._events[name];
                return this;
            }

            var cb;
            for (var i = 0; i < callbacks.length; i++) {
                cb = callbacks[i];
                if (cb === callback) {
                    callbacks.splice(i, 1);
                    i--;
                }
            }

            return this;
        },

        trigger: function(name) {
            var args = [].slice.call(arguments, 1),
                callbacks = this._events[name];

            if (callbacks) {
                for (var i = 0, l = callbacks.length; i < l; i++) {
                    callbacks[i].apply(this, args);
                }
            }

            return this;
        }
    };

    /**
     * 继承
     * @param prototype
     * @returns {Function}
     */
    VdWidget.extend = function(prototype) {
        _.defaults(prototype.defaults, this.prototype.defaults);
        return inherit(this, prototype);
    };

    /**
     * 挂载组件到dom中
     * @param widget {VdWidget} VdWidget类或子类，也可以是实例化的对象
     * @param node {Node} html节点
     */
    VdWidget.mount = function(widget, node) {
        if (widget.prototype && (widget.prototype instanceof VdWidget || widget === VdWidget)) {
            widget = new widget();
        }
        if (widget.rendered) {
            node.appendChild(widget.init());
        } else {
            widget.on('rendered', function() {
                node.appendChild(widget.init());
            });
        }
        return widget;
    };

    return VdWidget;
});