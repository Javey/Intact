'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _isEqual2 = require('lodash/fp/isEqual');

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _isFunction2 = require('lodash/fp/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _each2 = require('lodash/fp/each');

var _each3 = _interopRequireDefault(_each2);

var _result2 = require('lodash/fp/result');

var _result3 = _interopRequireDefault(_result2);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _thunk = require('./thunk');

var _thunk2 = _interopRequireDefault(_thunk);

var _vdt = require('vdt');

var _vdt2 = _interopRequireDefault(_vdt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Intact = function () {
    function Intact() {
        var _this = this;

        var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var contextWidgets = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Intact);

        if (!(this instanceof Intact)) {
            return new _thunk2.default(this, attributes, contextWidgets);
        }

        if (!this.template) {
            throw new Error('Can not instantiate when this.template does not exist.');
        }

        attrs = Object.assign({
            children: undefined
        }, (0, _result3.default)(this, 'defaults'), attrs);

        this._events = {};
        this.attributes = {};

        this.vdt = (0, _vdt2.default)(this.template);
        this.set(attrs, { silent: true });
        this.key = attrs.key;

        this.widgets = {};

        this.inited = false;
        this.rendered = false;
        this._hasCalledInit = false;

        this._contextWidgets = contextWidgets;
        this._widget = this.attributes.widget || _.uniqueId('widget');

        // for debug
        this.displayName = this.displayName;

        this.addEvents();

        this.children = this.get('children');
        delete this.attributes.children;
        // 存在widget名称引用属性，则注入所处上下文的widgets中
        this._contextWidgets[this._widget] = this;

        // 如果存在arguments属性，则将其拆开赋给attributes
        if (this.attributes.arguments) {
            Object.assign(this.attributes, (0, _result3.default)(this.attributes, 'arguments'));
            delete this.attributes.arguments;
        }

        // 注入组件，在模板中可以直接使用
        this.Animate = Animate;

        // change事件，自动更新，当一个更新操作正在进行中，下一个更新操作必须等其完成
        this._updateCount = 0;
        var handleUpdate = function handleUpdate() {
            if (_this._updateCount > 0) {
                _this.update();
                _this._updateCount--;
                handleUpdate.call(_this);
            }
        };
        this.on('change', function () {
            if (++this._updateCount === 1) {
                handleUpdate();
            } else if (this._updateCount > 10) {
                throw new Error('Too many recursive update.');
            }
        });

        var ret = this._init();
        // support promise
        var inited = function inited() {
            _this.inited = true;
            _this.trigger('inited', self);
        };
        if (ret && ret.then) {
            ret.then(inited);
        } else {
            inited();
        }
    }

    _createClass(Intact, [{
        key: '_init',
        value: function _init() {}
    }, {
        key: '_create',
        value: function _create() {}
    }, {
        key: '_beforeUpdate',
        value: function _beforeUpdate(prevWidget, domNode) {}
    }, {
        key: '_update',
        value: function _update(prevWidget, domNode) {}
    }, {
        key: '_destroy',
        value: function _destroy(domNode) {}
    }, {
        key: 'removeEvents',
        value: function removeEvents() {
            var _this2 = this;

            // 解绑所有事件
            (0, _each3.default)(this.attributes, function (value, key) {
                if (key.substring(0, 3) === 'ev-' && (0, _isFunction3.default)(value)) {
                    _this2.off(key.substring(3), value);
                    delete _this2.attributes[key];
                }
            });
        }
    }, {
        key: 'addEvents',
        value: function addEvents(attrs) {
            var _this3 = this;

            // 所有以'ev-'开头的属性，都转化为事件
            attrs || (attrs = this.attributes);
            (0, _each3.default)(attrs, function (value, key) {
                if (key.substring(0, 3) === 'ev-' && (0, _isFunction3.default)(value)) {
                    _this3.on(key.substring(3), value);
                }
            });
        }
    }, {
        key: 'init',
        value: function init(isUpdate /* for private */) {
            !isUpdate && (this.element = this.vdt.render(this));
            this.rendered = true;
            this._hasCalledInit = true;
            this.trigger('rendered', this);
            this._create();
            return this.element;
        }
    }, {
        key: 'update',
        value: function update(prevWidget, domNode) {
            if (!this.vdt.node && (!prevWidget || !prevWidget.vdt.node)) return;
            this._beforeUpdate(prevWidget, domNode);
            if (prevWidget && domNode) {
                this.vdt.node = domNode;
                this.vdt.tree = prevWidget.vdt.tree;
            }
            this.prevWidget = prevWidget;
            this.element = this.vdt.update(this);
            if (!this._hasCalledInit) {
                this.init(true);
            }
            this._update(prevWidget, domNode);
            return this.element;
        }
    }, {
        key: 'destroy',
        value: function destroy(domNode) {
            // 如果只是移动了一个组件，会先执行创建，再销毁，所以需要判断父组件引用的是不是自己
            if (this._contextWidgets[this._widget] === this) {
                delete this._contextWidgets[this._widget];
            }
            this.off();
            function destroy(children) {
                (0, _each3.default)(children, function (child) {
                    if (child.hasThunks) {
                        destroy(child.children);
                    } else if (child.type === 'Thunk') {
                        child.widget.destroy();
                    }
                });
            }
            destroy([this.vdt.tree]);
            this._destroy(domNode);
        }
    }, {
        key: 'get',
        value: function get(attr) {
            // @deprecated for v0.0.1 compatibility, use this.children instead of
            if (attr === 'children') {
                return this.attributes.children || this.children;
            }
            return arguments.length === 0 ? this.attributes : this.attributes[attr];
        }
    }, {
        key: 'set',
        value: function set(key, val, options) {
            var _this4 = this;

            if (key == null) return this;

            var attrs = void 0;
            if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options = Object.assign({
                silent: false,
                global: true,
                async: false
            }, options);

            var current = this.attributes,
                changes = [];

            for (var attr in attrs) {
                val = attrs[attr];
                if (!(0, _isEqual3.default)(current[attr], val)) {
                    changes.push(attr);
                }
                current[attr] = val;
            }

            if (changes.length) {
                var eventName = void 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = changes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _attr = _step.value;

                        eventName = 'change:' + _attr;
                        options[eventName] && options[eventName].call(this, current[_attr]);
                        !options.silent && this.trigger(eventName, this, current[_attr]);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                options.change && options.change.call(this);
                if (!options.silent) {
                    this.trigger('beforeChange', this);
                    if (options.global) {
                        clearTimeout(this._asyncUpdate);
                        if (options.async) {
                            this._asyncUpdate = setTimeout(function () {
                                _this4.trigger('change', _this4);
                            });
                        } else {
                            this.trigger('change', this);
                        }
                    }
                }
            }

            return this;
        }
    }, {
        key: 'on',
        value: function on(name, callback) {
            (this._events[name] || (this._events[name] = [])).push(callback);

            return this;
        }
    }, {
        key: 'off',
        value: function off(name, callback) {
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

            for (var cb, i = 0; i < callbacks.length; i++) {
                cb = callbacks[i];
                if (cb === callback) {
                    callbacks.splice(i, 1);
                    i--;
                }
            }

            return this;
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            var callbacks = this._events[name];

            if (callbacks) {
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = callbacks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var callback = _step2.value;

                        callback.apply(this, args);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            return this;
        }
    }]);

    return Intact;
}();

exports.default = Intact;