import Parser from './parser';
import Stringifier from './stringifier';
import * as utils from './utils';
import * as miss from 'misstime/src';

const parser = new Parser();
const stringifier = new Stringifier();

export default function Vdt(source, options) {
    if (!(this instanceof Vdt)) return new Vdt(source, options);

    this.template = compile(source, options);
    this.data = null;
    this.vNode = null;
    this.node = null;
    this.widgets = {};
    this.blocks = {};
}
Vdt.prototype = {
    constructor: Vdt,

    render(data, parentDom, queue, parentVNode, isSVG, blocks) {
        this.renderVNode(data, blocks, parentVNode);
        this.node = miss.render(this.vNode, parentDom, queue, parentVNode, isSVG);

        return this.node;
    },

    renderVNode(data, blocks, parentVNode) {
        if (data !== undefined) {
            this.data = data;
        }
        this.blocks = blocks;
        const vNode = this.vNode = this.template(this.data, Vdt, this.blocks, this.template) || miss.hc('empty');
        // for Animate we need this key
        if (vNode.key === undefined && parentVNode) {
            vNode.key = parentVNode.key;
        }

        return vNode;
    },

    renderString(data, blocks, parent) {
        this.data = data;
        const vNode = this.template(data, Vdt, blocks, this.template) || miss.hc('empty');

        return miss.renderString(vNode, parent, Vdt.configure().disableSplitText);
    },

    update(data, parentDom, queue, parentVNode, isSVG, blocks) {
        var oldVNode = this.vNode;
        this.renderVNode(data, blocks, parentVNode);
        this.node = miss.patch(oldVNode, this.vNode, parentDom, queue, parentVNode, isSVG);

        return this.node;
    },

    hydrate(data, dom, queue, parentDom, parentVNode, isSVG, blocks) {
        this.renderVNode(data, blocks, parentVNode);
        miss.hydrate(this.vNode, dom, queue, parentDom, parentVNode, isSVG);
        this.node = this.vNode.dom;

        return this.node;
    },

    destroy() {
        miss.remove(this.vNode);
    }
};

function compile(source, options) {
    var templateFn;

    // backward compatibility v0.2.2
    if (options === true || options === false) {
        options = {autoReturn: options};
    }

    options = utils.extend({}, utils.configure(), options);

    switch (typeof source) {
        case 'string':
            var ast = parser.parse(source, options),
                hscript = stringifier.stringify(ast, options);

            if (options.onlySource) {
                templateFn = function() {};
            } else {
                const buffer = stringifier.buffer;
                templateFn = new Function('obj', '_Vdt', 'blocks', '$callee', buffer.slice(1, buffer.length - 1).join(''));
            }
            templateFn.source = hscript;
            templateFn.head = stringifier.head;
            templateFn.mappings = stringifier.mappings;
            break;
        case 'function':
            templateFn = source;
            break;
        default:
            throw new Error('Expect a string or function');
    }

    return templateFn;
}

Vdt.parser = parser;
Vdt.stringifier = stringifier;
Vdt.miss = utils.extend({}, miss);
Vdt.compile = compile;
Vdt.utils = utils;
Vdt.setDelimiters = utils.setDelimiters;
Vdt.getDelimiters = utils.getDelimiters;
Vdt.configure = utils.configure;

// for compatibility v1.0
Vdt.virtualDom = miss; 
