webpackJsonp([2],{

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (obj, _Vdt, blocks) {
    if (false) {
        var __this = this;
        module.hot.dispose(function (data) {
            data.vdt = __this;
            data.isParent = __this.data !== obj;
        });
    }

    _Vdt || (_Vdt = Vdt);
    obj || (obj = {});
    blocks || (blocks = {});
    var h = _Vdt.miss.h,
        hc = _Vdt.miss.hc,
        hu = _Vdt.miss.hu,
        widgets = this && this.widgets || {},
        _blocks = {},
        __blocks = {},
        __u = _Vdt.utils,
        extend = __u.extend,
        _e = __u.error,
        _className = __u.className,
        __o = __u.Options,
        _getModel = __o.getModel,
        _setModel = __o.setModel,
        _setCheckboxModel = __u.setCheckboxModel,
        _detectCheckboxChecked = __u.detectCheckboxChecked,
        _setSelectModel = __u.setSelectModel,
        self = this.data,
        scope = obj,
        Animate = self && self.Animate;
    var layout = __webpack_require__(45);

    return function (blocks) {
        var _blocks = {},
            __blocks = extend({}, blocks),
            _obj = { 'className': 'index-page' } || {};
        if (_obj.hasOwnProperty("arguments")) {
            extend(_obj, _obj.arguments === null ? obj : _obj.arguments);delete _obj.arguments;
        }
        return layout.call(this, _obj, _Vdt, (_blocks.content = function (parent) {
            return [h('article', null, [h('h1', null, 'Intact'), h('p', null, '可继承的前端开发框架'), h('div', null, [h('a', { 'href': '#/document/start' }, '开始', 'button'), h('a', { 'href': 'https://github.com/Javey/intact', 'target': '_blank' }, 'GitHub', 'button white')], 'actions'), h('div', null, [h('div', null, [h('h2', null, '简单', 'blue'), h('div', null, '\n                        没有复杂的概念，你仅仅只需要了解HTML，CSS和JavaScript即可\n                    ')], 'feature'), h('div', null, [h('h2', null, '高效', 'yellow'), h('div', null, ['\n                        22KB min+gzip 大小，包含前端编译模块；', h('br'), '\n                        fork自目前最快的虚拟DOM引擎之一（inferno）构建\n                    '])], 'feature'), h('div', null, [h('h2', null, '可继承', 'red'), h('div', null, '\n                        充分发挥继承的优势，实现组件和模板的继承扩展，\n                        让你更快速方便地构建复杂的应用\n                    ')], 'feature')], 'features')], 'home-header'), h('article', null, [h('h1', null, '响应式组件'), h('script', { 'type': 'text/md' })], 'home-components')];
        }) && (__blocks.content = function (parent) {
            var self = this;
            return blocks.content ? blocks.content.call(this, function () {
                return _blocks.content.call(self, parent);
            }) : _blocks.content.call(this, parent);
        }) && __blocks);
    }.call(this, blocks);
};
if (false) {
    module.hot.accept();
    var vdt = module.hot.data && module.hot.data.vdt;
    if (vdt) {
        if (!module.hot.data.isParent) {
            vdt.template = module.exports;
        }
        vdt.update();
    }
}

/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(161);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(8)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/stylus-loader/index.js??ref--2-2!./index.styl", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/stylus-loader/index.js??ref--2-2!./index.styl");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 161:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(7)(undefined);
// imports


// module
exports.push([module.i, ".index-page .content-wrapper {\n  height: 100%;\n  background: #fff;\n  padding-top: 60px;\n  box-sizing: border-box;\n  text-align: center;\n}\n.index-page .home-header {\n  padding: 50px 0;\n}\n.index-page .home-header h1 {\n  font-size: 5em;\n}\n.index-page .home-header p {\n  font-size: 2em;\n  font-weight: 300;\n  color: #46484a;\n}\n.index-page .home-header .button {\n  display: inline-block;\n  background: #d04;\n  color: #fff;\n  padding: 0 2em;\n  border-radius: 0.2em;\n  margin: 0 10px;\n  height: 3em;\n  line-height: 3em;\n  box-sizing: border-box;\n}\n.index-page .home-header .button:hover {\n  background: #fe4444;\n}\n.index-page .home-header .button.white {\n  background: #fff;\n  border: 1px solid #ccc;\n  color: #666;\n}\n.index-page .home-header .button.white:hover {\n  background: #eee;\n}\n.index-page .home-header .features {\n  width: 1080px;\n  margin: 0 auto;\n  display: flex;\n  margin-top: 50px;\n}\n.index-page .home-header .feature {\n  flex: 1;\n}\n.index-page .home-header .feature h2 {\n  margin: 10px;\n}\n.index-page .home-components {\n  background: #09d;\n  height: 500px;\n  padding: 30px 0;\n  box-shadow: 0 -0.25em 1.5em rgba(0,5,10,0.25);\n}\n.index-page .home-components h1 {\n  font-size: 3em;\n  color: #fff;\n}\n", ""]);

// exports


/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Intact) {exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = __webpack_require__(159);

var _index2 = _interopRequireDefault(_index);

var _index3 = __webpack_require__(160);

var _index4 = _interopRequireDefault(_index3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_Intact) {
    _inherits(_class, _Intact);

    function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, _Intact.apply(this, arguments));
    }

    _createClass(_class, [{
        key: 'template',
        get: function get() {
            return _index2.default;
        }
    }]);

    return _class;
}(Intact);

exports.default = _class;
module.exports = exports['default'];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),

/***/ 45:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (obj, _Vdt, blocks) {
    if (false) {
        var __this = this;
        module.hot.dispose(function (data) {
            data.vdt = __this;
            data.isParent = __this.data !== obj;
        });
    }

    _Vdt || (_Vdt = Vdt);
    obj || (obj = {});
    blocks || (blocks = {});
    var h = _Vdt.miss.h,
        hc = _Vdt.miss.hc,
        hu = _Vdt.miss.hu,
        widgets = this && this.widgets || {},
        _blocks = {},
        __blocks = {},
        __u = _Vdt.utils,
        extend = __u.extend,
        _e = __u.error,
        _className = __u.className,
        __o = __u.Options,
        _getModel = __o.getModel,
        _setModel = __o.setModel,
        _setCheckboxModel = __u.setCheckboxModel,
        _detectCheckboxChecked = __u.detectCheckboxChecked,
        _setSelectModel = __u.setSelectModel,
        self = this.data,
        scope = obj,
        Animate = self && self.Animate;
    var nav = [{
        title: '教程',
        href: 'document'
    }, {
        title: 'API',
        href: 'api'
    }];
    return h('div', null, [h('div', null, h('header', null, (_blocks.header = function (parent) {
        return [h('a', { 'href': '#/' }, 'Intact', 'logo'), h('nav', null, _Vdt.utils.map(function () {
            try {
                return [nav][0];
            } catch (e) {
                _e(e);
            }
        }.call(this), function (value, key) {
            return h('a', { 'href': function () {
                    try {
                        return ['#/' + value.href][0];
                    } catch (e) {
                        _e(e);
                    }
                }.call(this) }, function () {
                try {
                    return [value.title][0];
                } catch (e) {
                    _e(e);
                }
            }.call(this), _className(function () {
                try {
                    return [{
                        active: value.href === scope.navIndex
                    }][0];
                } catch (e) {
                    _e(e);
                }
            }.call(this)));
        }, this))];
    }) && (__blocks.header = function (parent) {
        var self = this;
        return blocks.header ? blocks.header.call(this, function () {
            return _blocks.header.call(self, parent);
        }) : _blocks.header.call(this, parent);
    }) && __blocks.header.call(this)), 'header-wrapper'), h('div', null, (_blocks.content = function (parent) {
        return null;
    }) && (__blocks.content = function (parent) {
        var self = this;
        return blocks.content ? blocks.content.call(this, function () {
            return _blocks.content.call(self, parent);
        }) : _blocks.content.call(this, parent);
    }) && __blocks.content.call(this), 'content-wrapper')], _className(function () {
        try {
            return ['main-wrapper ' + (scope.className || '')][0];
        } catch (e) {
            _e(e);
        }
    }.call(this)));
};
if (false) {
    module.hot.accept();
    var vdt = module.hot.data && module.hot.data.vdt;
    if (vdt) {
        if (!module.hot.data.isParent) {
            vdt.template = module.exports;
        }
        vdt.update();
    }
}

/***/ })

});