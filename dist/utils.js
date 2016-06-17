'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _isFunction2 = require('lodash/fp/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _each2 = require('lodash/fp/each');

var _each3 = _interopRequireDefault(_each2);

exports.inherit = inherit;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * inherit
 * @param Parent
 * @param prototype
 * @returns {Function}
 */
function inherit(Parent, prototype) {
    var _this = this;

    var Child = function Child() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (!(_this instanceof Child || _this.prototype instanceof Child)) {
            return Parent.apply(Child, args);
        }
        return Parent.apply(_this, args);
    };

    Child.prototype = Object.create(Parent.prototype);
    (0, _each3.default)(prototype, function (proto, name) {
        var _this2 = this;

        if (name === 'displayName') {
            Child.displayName = proto;
        }
        if ((0, _isFunction3.default)(proto) || name === 'template') {
            return Child.prototype[name] = proto;
        }
        Child.prototype[name] = function () {
            var _super = function _super() {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return Parent.prototype[name].apply(_this2, args);
            },
                _superApply = function _superApply(args) {
                return Parent.prototype[name].apply(_this2, args);
            };
            return function () {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                let__super = _this2._super, __superApply = _this2._superApply, returnValue;

                _this2._super = _super;
                _this2._superApply = _superApply;

                returnValue = proto.apply(_this2, args);

                _this2._super = __super;
                _this2._superApply = __superApply;

                return returnValue;
            };
        }();
    });
    Child.__super = Parent.prototype;
    Child.prototype.constructor = Child;

    Object.assign(Child, Parent);

    return Child;
}