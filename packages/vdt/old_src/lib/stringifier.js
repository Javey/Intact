/**
 * @fileoverview stringify ast of jsx to js
 * @author javey
 * @date 15-4-22
 */

import * as Utils from './utils';

const {Type, TypeName} = Utils;

const attrMap = (function() {
    var map = {
        'class': 'className',
        'for': 'htmlFor'
    };
    return function(name) {
        return map[name] || name;
    };
})();
    
export default function Stringifier() {}

Stringifier.prototype = {
    constructor: Stringifier,

    stringify: function(ast, options) {
        this._init(options);

        this._start(ast);

        return this.buffer.join('');
    },

    /**
     * @brief for unit test to get body
     *
     * @param ast
     * @param options
     */
    body(ast, options) {
        this._init(options);

        this._visitJSXExpressionContainer(ast, true);

        return this.buffer.join('');
    },

    _init(options) {
        this.options = Utils.extend({}, Utils.configure(), options);

        this.enterStringExpression = false;
        this.head = ''; // save import syntax

        this.indent = 0;

        this.buffer = [];
        this.queue = [];
        this.mappings = [];

        this.line = 1;
        this.column = 0;
    },

    _start(ast) {
        this._append('function(obj, _Vdt, blocks, $callee) {\n');
        this._indent();
        const params = [
            '_Vdt || (_Vdt = Vdt);',
            'obj || (obj = {});',
            'blocks || (blocks = {});',
            'var h = _Vdt.miss.h, hc = _Vdt.miss.hc, hu = _Vdt.miss.hu, widgets = this && this.widgets || {}, _blocks = {}, __blocks = {},',
            '    __u = _Vdt.utils, extend = __u.extend, _e = __u.error, _className = __u.className, __slice = __u.slice, __noop = __u.noop,',
            '    __m = __u.map, __o = __u.Options, _getModel = __o.getModel, _setModel = __o.setModel,',
            '    _setCheckboxModel = __u.setCheckboxModel, _detectCheckboxChecked = __u.detectCheckboxChecked,',
            '    _setSelectModel = __u.setSelectModel,',
            (this.options.server ? 
            '    require = function(file) { return _Vdt.require(file, "' + 
                     this.options.filename.replace(/\\/g, '\\\\') + 
            '    ") }, ' : 
            undefined),
            '    self = this.data, $this = this, scope = obj, Animate = self && self.Animate, parent = ($callee || {})._super;',
        ];

        Utils.each(params, code => {
            if (code) {
                this._append(code);
                this._append('\n');
            }
        });

        this._append('\n');

        if (!this.options.noWith) {
            this._append('with (obj) {\n');
            this._indent();
            this._visitJSXExpressionContainer(ast, true);
            this._append('\n');
            this._dedent();
            this._append('}\n');
        } else {
            this._visitJSXExpressionContainer(ast, true);
            this._append('\n');
        }
        this._dedent();
        this._append('}')
    },

    _visitJSXExpressionContainer: function(ast, isRoot) {
        let length = ast.length;
        let addWrapper = false;
        let hasDestructuring = false;
        
        if (!isRoot && !this.enterStringExpression) {
            const element = ast[0];
            if (element && element.type === Type.JS) {
                // special for ... syntaxt
                const value = element.value;
                if (value[0] === '.' && value[1] === '.' && value[2] === '.') {
                    hasDestructuring = true;
                    element.value = value.substr(3);
                    this._append('...');
                }
            }

            this._append('function() {try {return (');
            addWrapper = true;
        }

        Utils.each(ast, function(element, i) {
            // if is root, add `return` keyword
            if (this.options.autoReturn && isRoot && i === length - 1) {
                this._append('return ');
            }

            this._visit(element, isRoot);
        }, this);

        if (addWrapper) {
            this._append(')} catch(e) {_e(e)}}.call($this)');
        }
    },

    _visit: function(element, isRoot) {
        element = element || {};
        switch (element.type) {
            case Type.JS:
                return this._visitJS(element);
            case Type.JSImport:
                return this._visitJSImport(element);
            case Type.JSXElement:
                return this._visitJSXElement(element);
            case Type.JSXText:
                return this._visitJSXText(element);
            case Type.JSXUnescapeText:
                return this._visitJSXUnescapeText(element);
            case Type.JSXExpressionContainer:
                return this._visitJSXExpressionContainer(element.value);
            case Type.JSXWidget:
                return this._visitJSXWidget(element);
            case Type.JSXBlock:
                return this._visitJSXBlock(element, true);
            case Type.JSXVdt:
                return this._visitJSXVdt(element, isRoot);
            case Type.JSXComment:
                return this._visitJSXComment(element);
            case Type.JSXTemplate:
                return this._visitJSXTemplate(element);
            case Type.JSXString:
                return this._visitJSXString(element);
            default:
                return this._append('null');
        }
    },

    _visitJS: function(element) {
        const ret = this.enterStringExpression ? 
            '(' + element.value + ')' : 
            element.value; 

        this._append(ret, element);
    },

    _visitJSImport(element) {
        this.head += element.value;
    },

    _visitJSXElement: function(element) {
        if (element.value === 'template') {
            // <template> is a fake tag, we only need handle its children and itself directives
            this._visitJSXDirective(element, () => {
                this._visitJSXChildren(element.children);
            });
        } else {
            this._visitJSXDirective(element, () => {
                this.__visitJSXElement(element);
            });
        }
    },

    __visitJSXElement(element) {
        this._append(`h('${element.value}'`, element);

        this._appendQueue(', ');
        const {attributes} = this._visitJSXAttribute(element, true, true, true /* appendQueue */);

        this._appendQueue(', ');
        this._visitJSXChildren(element.children, true /* appendQueue */);

        this._appendQueue(', ');
        if (attributes.className) {
            this._visitJSXAttributeClassName(attributes.className);
        } else {
            this._appendQueue('null');
        }

        this._appendQueue(', ');
        if (attributes.key) {
            this._visitJSXAttributeValue(attributes.key);
        } else {
            this._appendQueue('null');
        }

        this._appendQueue(', ');
        if (attributes.ref) {
            this._visitJSXAttributeRef(attributes.ref);
        }

        this._clearQueue();
        this._append(')');
    },

    _visitJSXChildren: function(children, appendQueue) {
        const length = children.length;
        if (!length) {
            if (appendQueue) {
                this._appendQueue('null');
            } else {
                this._append('null');
            }
        }
        if (length > 1) {
            this._append('[\n');
            this._indent();
        }
        Utils.each(children, function(child, index) {
            this._visit(child);
            if (index !== length - 1) {
                this._append(',\n');
            }
        }, this);
        if (length > 1) {
            this._append('\n');
            this._dedent();
            this._append(']');
        }
    },

    _visitJSXDirective: function(element, body) {
        let directiveFor = {};
        let directiveIf;

        Utils.each(element.directives, function(directive) {
            switch (directive.name) {
                case 'v-if':
                    directiveIf = directive;
                    break;
                case 'v-for':
                    directiveFor.data = directive.value;
                    break;
                case 'v-for-value':
                    directiveFor.value = directive.value;
                    break;
                case 'v-for-key':
                    directiveFor.key = directive.value;
                    break;
                default:
                    break;
            }
        }, this);

        // handle v-for firstly
        if (directiveFor.data) {
            if (directiveIf) {
                this._visitJSXDirectiveFor(directiveFor, element, () => {
                    this._visitJSXDirectiveIf(directiveIf, element, body);
                });
            } else {
                this._visitJSXDirectiveFor(directiveFor, element, body);
            }
        } else if (directiveIf) {
            this._visitJSXDirectiveIf(directiveIf, element, body);
        } else {
            body();
        }
    },

    _visitJSXDirectiveIf: function(directive, element, body) {
        var hasElse = false,
            next = element,
            indent = this.indent;

        this._visitJSXAttributeValue(directive.value);
        this._append(' ?\n');
        this._indent();
        body();
        this._append(' :\n');

        while (next = next.next) {
            const nextDirectives = next.directives;

            if (!nextDirectives) break;

            const velseif = nextDirectives['v-else-if'];
            if (velseif) {
                this._visitJSXAttributeValue(velseif.value);
                this._append(' ?\n');
                this._indent();
                this._visit(next);
                this._append(' :\n');
                continue;
            }
            if (nextDirectives['v-else']) {
                this._visit(next);
                hasElse = true;
            }

            break;
        }

        if (!hasElse) this._append('undefined');

        this.indent = indent;
    },

    _visitJSXDirectiveFor: function(directive, element, body) {
        this._append('__m(');
        this._visitJSXAttributeValue(directive.data);
        this._append(', function(');
        if (directive.value) {
            this._visitJSXText(directive.value, true);
        } else {
            this._append('value');
        }
        this._append(', ');
        if (directive.key) {
            this._visitJSXText(directive.key, true);
        } else {
            this._append('key');
        }
        this._append(') {\n');
        this._indent();
        this._append('return ');
        body();
        this._append(';\n');
        this._dedent();
        this._append('}, $this)');
    },

    _visitJSXString: function(element) {
        this.enterStringExpression = true;
        const length = element.value.length;
        Utils.each(element.value, function(child, i) {
            this._visit(child);
            if (i !== length - 1) {
                this._append(' + ');
            }
        }, this);
        this.enterStringExpression = false;
    },

    _visitJSXAttribute: function(element, individualClassName, individualKeyAndRef, appendQueue) {
        var set = {},
            events = {},
            // support bind multiple callbacks for the same event
            addEvent = (name, attr) => {
                const v = events[name];
                if (!v) {
                    events[name] = [];
                }
                events[name].push(attr);
            },
            attributes = element.attributes,
            models = [],
            addition = {},
            isFirst;

        const addAttribute = (name, attr) => {
            if (isFirst === undefined) {
                this._append('{\n');
                this._indent();
                isFirst = true;
            }
            if (!isFirst) {
                this._append(',\n');
            }
            if (name) {
                this._append(`'${name}': `, attr);
            }
            isFirst = false;
        }

        Utils.each(attributes, function(attr) {
            if (attr.type === Type.JSXExpressionContainer) {
                addAttribute();
                this._visitJSXAttributeValue(attr);
                return;
            }

            let name = attrMap(attr.name);

            if (name === 'className') {
                if (!individualClassName) {
                    addAttribute(name, attr);
                    this._visitJSXAttributeClassName(attr.value);
                }
            } else if (name === 'key') {
                if (!individualKeyAndRef) {
                    addAttribute(name, attr);
                    this._visitJSXAttributeValue(attr.value);
                }
            } else if (name === 'widget' || name === 'ref') {
                if (!individualClassName) {
                    addAttribute('ref', attr);
                    this._visitJSXAttributeRef(attr.value);   
                }
            } else if (Utils.isVModel(name)) {
                let [, model] = name.split(':');

                if (model === 'value') name = 'v-model';
                if (!model) model = 'value';

                models.push({name: model, value: attr.value, attr: attr});
            } else if (name === 'v-model-true') {
                addition.trueValue = attr.value;
            } else if (name === 'v-model-false') {
                addition.falseValue = attr.value;
            } else if (name === 'type') {
                // save the type for v-model of input element
                addAttribute('type', attr);
                this._visitJSXAttributeValue(attr.value);
                addition.type = this.last;
            } else if (name === 'value') {
                addAttribute('value', attr);
                this._visitJSXAttributeValue(attr.value);
                addition.value = attr.value;
            } else if (Utils.isEventProp(name)) {
                addEvent(name, attr);
            } else if (name === '_blocks') {
                addAttribute('_blocks');
                this._visitJSXBlocks(attr.value, false);
            } else {
                addAttribute(name, attr);
                this._visitJSXAttributeValue(attr.value);
            }

            // for get property directly 
            set[name] = attr.value;
        }, this);

        for (let i = 0; i < models.length; i++) {
            this._visitJSXAttributeModel(element, models[i], addition, addEvent, addAttribute);
        }

        Utils.each(events, (events, name) => {
            addAttribute(name, events[0]);

            const length = events.length;
            if (length > 1) {
                this._append('[\n');
                this._indent();
            }
            for (let i = 0; i < length; i++) {
                const event = events[i];
                if (typeof event === 'function') {
                    event();
                } else {
                    this._visitJSXAttributeValue(event.value);
                }
                if (i !== length - 1) {
                    this._append(',\n');
                }
            }
            if (length > 1) {
                this._append('\n');
                this._dedent();
                this._append(']');
            }
        });

        if (isFirst !== undefined) {
            this._append('\n');
            this._dedent();
            this._append('}');
        } else {
            if (appendQueue) {
                this._appendQueue('null');
            } else {
                this._append('null');
            }
        }

        return {attributes: set, hasProps: isFirst !== undefined}; 
    },

    _visitJSXAttributeClassName(value) {
        if (value.type === Type.JSXExpressionContainer) {
            // for class={ {active: true} }
            this._append('_className(');
            this._visitJSXAttributeValue(value);
            this._append(')');
        } else {
            this._visitJSXAttributeValue(value);
        }
    },

    _visitJSXAttributeRef(value) {
        if (value.type === Type.JSXText) {
            // for compatility v1.0
            // convert widget="a" to ref=(i) => widgets.a = i
            // convert ref="a" to ref=(i) => widgets.a = i. For Intact
            this._append(`function(i) {widgets[`);
            this._visitJSXAttributeValue(value);
            this._append(`] = i}`);
        } else {
            this._visitJSXAttributeValue(value);
        }
    },

    _visitJSXAttributeModel: function(element, model, addition, addEvent, addAttribute) {
        var valueName = model.name,
            value = model.value,
            eventName = 'change'; 

        const append = (...args) => {
            for (let i = 0; i < args.length; i++) {
                if (i % 2) {
                    this._visitJSXAttributeValue(args[i]);
                } else {
                    this._append(args[i]);
                }
            }
        };

        if (element.type === Type.JSXElement) {
            switch (element.value) {
                case 'input':
                    switch (addition.type) {
                        case "'file'":
                            eventName = 'change';
                            break;
                        case "'radio'":
                        case "'checkbox'":
                            addAttribute('checked', model.attr);
                            var trueValue = addition.trueValue || {type: Type.JS, value: 'true'},
                                falseValue = addition.falseValue || {type: Type.JS, value: 'false'},
                                inputValue = addition.value;
                            if (Utils.isNullOrUndefined(inputValue)) {
                                append('_getModel(self, ', value, ') === ', trueValue);
                                addEvent('ev-change', () => {
                                    append('function(__e) {_setModel(self, ', value, ', __e.target.checked ? ', trueValue, ' : ', falseValue, ', $this);}');
                                });
                            } else {
                                if (addition.type === "'radio'") {
                                    append(`_getModel(self, `, value, ') === ', inputValue);
                                    addEvent('ev-change', () => {
                                        append('function(__e) {_setModel(self, ', value, ', __e.target.checked ? ', inputValue, ' : ', falseValue, ', $this);}');
                                    });
                                } else {
                                    append(`_detectCheckboxChecked(self, `, value, ', ', inputValue, ')');
                                    addEvent('ev-change', () => {
                                        append('function(__e) {_setCheckboxModel(self, ', value, ', ', inputValue, ', ', falseValue, ', __e, $this);}');
                                    });
                                }
                            }
                            return;
                        default:
                            eventName = 'input';
                            break;
                    }
                    break;
                case 'select':
                    addAttribute('value', model.attr);
                    append('_getModel(self, ', value, ')');
                    addEvent('ev-change', () => {
                        append('function(__e) {_setSelectModel(self, ', value, ', __e, $this);}');
                    });
                    return;
                case 'textarea':
                    eventName = 'input';
                    break;
                default:
                    break;
            }
            addEvent(`ev-${eventName}`, () => {
                append('function(__e) { _setModel(self, ', value, ', __e.target.value, $this) }');
            });
        } else if (element.type === Type.JSXWidget) {
            addEvent(`ev-$change:${valueName}`, () => {
                append('function(__c, __n) { _setModel(self, ', value, ', __n, $this) }');
            });
        }
        addAttribute(valueName, model.attr);
        append(`_getModel(self, `, value, ')');
    },

    _visitJSXAttributeValue: function(value) {
        Utils.isArray(value) ? this._visitJSXChildren(value) : this._visit(value, false);
    },

    _visitJSXText: function(element, noQuotes) {
        var ret = element.value.replace(/([\'\"\\])/g, '\\$1').replace(/[\r\n]/g, '\\n');
        if (!noQuotes) {
            ret = "'" + ret + "'";
        }

        this._append(ret, element);
    },

    _visitJSXUnescapeText: function(element) {
        this._append('hu(', element);
        this._visitJSXExpressionContainer(element.value);
        this._append(')');
    },

    _visitJSXWidget(element) {
        this._visitJSXDirective(element, () => {
            this.__visitJSXWidget(element);
        });
    },

    __visitJSXWidget: function(element) {
        const {blocks, children} = this._getJSXBlocks(element);

        if (children.length) {
            element.attributes.push({name: 'children', value: children});
        }
        element.attributes.push({name: '_context', value: {
            type: Type.JS,
            value: '$this'
        }});
        if (blocks.length) {
            element.attributes.push({name: '_blocks', value: blocks});
        }

        this._append(`h(${element.value}, `, element);
        this._visitJSXAttribute(element, false, false);
        this._append(')');
    },

    _visitJSXBlock: function(element, isAncestor) {
        this._visitJSXDirective(element, () => {
            this.__visitJSXBlock(element, isAncestor);
        });
    },

    __visitJSXBlock(element, isAncestor) {
        const {params, args} = this._getJSXBlockAttribute(element);
        const name = element.value;

        this._append(`(_blocks['${name}'] = function(parent`, element);
        if (params) {
            this._append(', ');
            this._visitJSXText(params, true);
        }
        this._append(') {\n');
        this._indent();
        this._append('return ');
        this._visitJSXChildren(element.children);
        this._append(';\n');
        this._dedent();
        this._append(`}) && (__blocks['${name}'] = function(parent) {\n`);
        this._indent();
        this._append(`var args = arguments;\n`);
        this._append(`return blocks['${name}'] ? blocks['${name}'].apply($this, [function() {\n`);
        this._indent();
        this._append(`return _blocks['${name}'].apply($this, args);\n`);
        this._dedent();
        this._append(`}].concat(__slice.call(args, 1))) : _blocks['${name}'].apply($this, args);\n`);
        this._dedent();
        this._append(`})`);
        if (isAncestor) {
            this._append(` && __blocks['${name}'].apply($this, `);
            if (args) {
                this._append('[__noop].concat(');
                this._visitJSXAttributeValue(args);
                this._append(')');
            } else {
                this._append('[__noop]');
            }
            this._append(')');
        }
    },

    _getJSXBlockAttribute: function(element) {
        const ret = {};

        Utils.each(element.attributes, function(attr) {
            const name = attr.name;
            let value;
            switch (name) {
                case 'args':
                    ret.args = attr.value;
                    break;
                case 'params':
                    ret.params = attr.value;
                    break;
                default:
                    return;
            }
        }, this);
          
        return ret;
    },

    _getJSXBlocks: function(element) {
        const blocks = [];
        const children = [];

        Utils.each(element.children, function(child) {
            if (child.type === Type.JSXBlock) {
                blocks.push(child);
            } else {
                children.push(child);
            }
        }, this);

        return {blocks, children};
    },

    _visitJSXBlocks(blocks, isRoot) {
        const length = blocks.length;
        if (!length) return this._append(isRoot ? 'blocks' : 'null');

        this._append('function(blocks) {\n');
        this._indent();
        this._append('var _blocks = {}, __blocks = extend({}, blocks);\n');
        this._append('return (');

        for (let i = 0; i < length; i++) {
            this._visitJSXBlock(blocks[i], false);
            if (i !== length - 1) {
                this._append(' && ');
            }
        }
        this._append(', __blocks);\n');
        this._dedent();
        this._append(`}.call($this, ${isRoot ? 'blocks' : '{}'})`);
    },

    _visitJSXVdt: function(element, isRoot) {
        this._visitJSXDirective(element, () => {
            this.__visitJSXVdt(element, isRoot);
        });
    },

    __visitJSXVdt(element, isRoot) {
        const name = element.value;
        const {blocks, children} = this._getJSXBlocks(element);

        if (children.length) {
            element.attributes.push({name: 'children', value: children});
        }

        this._append('(function() {\n', element);
        this._indent();
        this._append('var _obj = ');
        const {attributes} = this._visitJSXAttribute(element, false, false);
        this._append(';\n');
        if (attributes.hasOwnProperty('arguments')) {
            this._append('extend(_obj, _obj.arguments === true ? obj : _obj.arguments);\n');
            this._append('delete _obj.arguments;\n');
        }
        this._append(`return ${name}.call($this, _obj, _Vdt, `);
        this._visitJSXBlocks(blocks, isRoot);
        this._append(`, ${name})\n`);
        this._dedent();
        this._append('}).call($this)');
    },

    _visitJSXComment: function(element) {
        this._append('hc(');
        this._visitJSXText(element);
        this._append(')');
    },

    _addMapping(element) {
        this.mappings.push({
            generated: {
                line: this.line,
                column: this.column, 
            },
            original: element && element.line !== undefined ? {
                line: element.line,
                column: element.column,
            } : undefined,
        });
    },

    _append(code, element) {
        const buffer = this.buffer;
        const {sourceMap, indent} = this.options;

        this._flushQueue();
        if (sourceMap) {
            this._addMapping(element);
        }

        // add indent if the last line ends with \n
        if (
            indent && this.indent && this.last && 
            this.last[this.last.length - 1] === '\n' && 
            code[0] !== '\n'
        ) {
            buffer.push(new Array(this.indent + 1).join(indent));
            this.column += indent.length * this.indent;
        }

        this.last = code;

        buffer.push(code);

        if (sourceMap) {
            for (let i = 0; i < code.length; i++) {
                if (code[i] === '\n') {
                    this.line++;
                    this.column = 0;
                } else {
                    this.column++;
                }
            }
        }
    },

    _appendQueue(code, element) {
        this.queue.push([code, element]);        
    },

    _flushQueue() {
        const queue = this.queue;
        let item;
        while (item = queue.shift()) {
            this._append(item[0], item[1]);
        }
    },

    _clearQueue() {
        this.queue = [];
    },

    _indent() {
        this.indent++;
    },

    _dedent() {
        this.indent--;
    },
};
