import {endEvents, addClass, removeClass} from './utils';
import Vdt from 'vdt/src/client';

const h = Vdt.miss.h;
const {className: c, extend: e} = Vdt.utils;

const prototype = {
    defaults() {
        return {
            'a:continuity': true, // 是否保持连贯性
            'a:tag': 'div',
            'a:transition': 'animate',
            'a:appear': false,
            'a:mode': 'both', // out-in | in-out | both
            'a:disabled': false, // 只做动画管理者，自己不进行动画
            'a:move': true, // 是否执行move动画
            'a:css': true, // 是否使用css动画，如果自定义动画函数，可以将它置为false
            'a:delayDestroy': true, // 是否动画完成才destroy子元素
            'a:show': true, // 是否应用展示、隐藏动画
        }
    },

    template() {
        const self = this.data;
        const tagName = self.get('a:tag');
        const props = {};
        const _props = self.get();
        const _staticClass = self._staticClass;

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
        const oClassName = props.className;
        props.className = c(e({[oClassName]: oClassName}, _staticClass)) || undefined;

        if (self._isRenderString) {
            const show = self.get('a:show');
            if (!show) {
                const oStyle = props.style;
                if (!oStyle) {
                    props.style = {display: 'none'};
                } else {
                    const type = typeof oStyle;
                    if (type === 'string') {
                        props.style = oStyle + 'display: none;';
                    } else if (type === 'object' && oStyle) {
                        props.style.display = 'none';
                    }
                }
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

        // convert show to Boolean
        this.on('$receive:a:show', (c, v) => {
            this.set('a:show', !!v, {silent: true});
        });

        this._staticClass = {};
    },

    _addClass(className) {
        this._staticClass[className] = true;
        addClass(this.element, className);
    },

    _removeClass(className) {
        delete this._staticClass[className];
        removeClass(this.element, className);
    },

    toString() {
        this._isRenderString = true;
        const ret = this._super();
        this._isRenderString = false;

        return ret;
    }
};

export default prototype;
