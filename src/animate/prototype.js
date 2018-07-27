import {endEvents} from './utils';
import {inBrowser} from '../utils';
import Vdt from 'vdt';

const prototype = {
    defaults() {
        return {
            'a:tag': 'div',
            'a:transition': 'animate',
            'a:appear': false,
            'a:mode': 'both', // out-in | in-out | both
            'a:disabled': false, // 只做动画管理者，自己不进行动画
            'a:move': true, // 是否执行move动画
            'a:css': true, // 是否使用css动画，如果自定义动画函数，可以将它置为false
            'a:delayDestroy': true, // 是否动画完成才destroy子元素
        }
    },

    template() {
        const h = Vdt.miss.h;
        const self = this.data;
        const tagName = self.get('a:tag');
        const props = {};
        const _props = self.get();

        for (let key in _props) {
            if (
                key !== 'ref' && 
                key !== 'key' && 
                (key[0] !== 'a' || key[1] !== ':') && 
                key.substr(0, 5) !== 'ev-a:'
            ) {
                props[key] = _props[key];
            }
        }

        return h(tagName, props, self.get('children'));
    },

    _init() {
        if (!endEvents.length) {
            // 如果不支持css动画，则关闭css
            this.set({
                'a:css': false,
                'a:move': false
            }, {silent: true});
        }

        this.mountChildren = [];
        this.unmountChildren = [];
        this.updateChildren = [];
        this.children = [];
        this._enteringAmount = 0;
        this._leavingAmount = 0;
    },

    init: inBrowser ? 
        function(lastVNode, nextVNode) {
            const parentDom = this.parentVNode && this.parentVNode.dom || this.parentDom;
            if (parentDom && parentDom._reserve) {
                lastVNode = parentDom._reserve[nextVNode.key];
            }

            return this._super(lastVNode, nextVNode);
        } : 
        function() { 
            return this._superApply(arguments); 
        },
};

export default prototype;
