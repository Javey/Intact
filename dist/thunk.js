'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _result2 = require('lodash/fp/result');

var _result3 = _interopRequireDefault(_result2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Thunk = function () {
    function Thunk(Widget, attributes, contextWidget) {
        _classCallCheck(this, Thunk);

        this.Widget = Widget;
        this.attributes = attributes || {};
        this.key = this.attributes.key;
        this.contextWidget = contextWidget;
    }

    _createClass(Thunk, [{
        key: 'render',
        value: function render(previous) {
            if (!previous || previous.Widget !== this.Widget || previous.key !== this.key) {
                this.widget = new this.Widget(this.attributes, this.contextWidget);
            } else if (previous.Widget === this.Widget) {
                if (!previous.widget) throw new Error('Don\'t update when updating.');

                var widget = this.widget = previous.widget;
                widget.children = this.attributes.children;
                delete this.attributes.children;

                // 如果存在arguments属性，则将其拆开赋给attributes
                if (this.attributes.arguments) {
                    Object.assign(this.attributes, (0, _result3.default)(this.attributes, 'arguments'));
                    delete this.attributes.arguments;
                }

                widget.removeEvents();
                widget.addEvents(this.attributes);
                widget.set(this.attributes, { global: false });

                // 当一个组件，用同一个组件的另一个实例，去更新自己，由于子组件都相同
                // 所以子组件不会新建，也就写入不了新实例的widgets引用中，这里强制设置一遍
                this.contextWidget[this.widget._widget] = this.widget;
            }

            return this.widget;
        }
    }, {
        key: 'type',
        get: function get() {
            return 'Thunk';
        }
    }]);

    return Thunk;
}();

exports.default = Thunk;