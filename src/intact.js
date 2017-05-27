import {
    inherit, extend, result, each, isFunction, 
    isEqual, uniqueId, get, set, castPath, hasOwn
} from './utils';
import Vdt from 'vdt';
import {EMPTY_OBJ} from 'miss/src/vnode';
import {isNullOrUndefined, isEventProp} from 'miss/src/utils';

export default class Intact {
    constructor(props) {
        if (!this.template) {
            throw new Error('Can not instantiate when this.template does not exist.');
        }
        
        props = extend({}, result(this, 'defaults'), props);

        this._events = {};
        this.props = {};
        this.vdt = Vdt(this.template);
        this.set(props, {silent: true});

        // for compatibility v1.0
        this.widgets = this.vdt.widgets || {};
        this._widget = this.props.widget || uniqueId('widget');
        this.attributes = this.props;

        this.inited = false;
        this.rendered = false;
        this.mounted = false;

        // for debug
        this.displayName = this.displayName;

        this.addEvents();

        this._updateCount = 0;

        const inited = () => {
            this.inited = true;
            this.on('change', () => this.update());
            this.trigger('inited', this);
        };
        const ret = this._init();
        if (ret && ret.then) {
            ret.then(inited);
        } else {
            inited();
        }
    }

    addEvents(props = this.props) {
        each(props , (value, key) => {
            if (isEventProp(key) && isFunction(value)) {
                this.on(key.substr(3), value);
            }
        });
    }

    _init(props) {}
    _create(lastVNode, nextVNode) {}
    _mount(lastVNode, nextVNode) {}
    _beforeUpdate(lastVNode, nextVNode) {}
    _update(lastVNode, nextVNode) {}
    _destroy(lastVNode, nextVNode) {}

    init(lastVNode, nextVNode) {
        if (!this.inited) {
            // 支持异步组件
            const placeholder = document.createComment('placeholder');
            this.one('inited', () => {
                const parent = placeholder.parentNode;
                if (parent) {
                    parent.replaceChild(this.init(), placeholder);
                }
            });
            return placeholder;
        }
        this.element = this.vdt.render(this);
        this.rendered = true;
        this.trigger('rendered', this);
        this._create(lastVNode, nextVNode);

        return this.element;
    }

    mount(lastVNode, nextVNode) {
        this.mounted = true;
        this.trigger('mounted', this);
        this._mount(lastVNode, nextVNode);
    }

    update(lastVNode, nextVNode) {
        // 如果还没有渲染，则不去更新
        if (!this.rendered) return;

        ++this._updateCount;
        if (this._updateCount > 1) return this.element;
        if (this._updateCount === 1) return this.__update(lastVNode, nextVNode);
    }

    __update(lastVNode, nextVNode) {
        // 如果不存在nextVNode，则为直接调用update方法更新自己
        // 否则则是父组件触发的子组件更新，此时需要更新一些状态
        if (nextVNode) {
            this._patchProps(lastVNode.props, nextVNode.props);
        }

        this._beforeUpdate(lastVNode, nextVNode);
        this.element = this.vdt.update(this);
        this._update(lastVNode, nextVNode);

        if (--this._updateCount > 0) {
            // 如果更新完成，发现还有更新，则是在更新过程中又触发了更新
            // 此时直接将_updateCount置为0，因为所有数据都已更新，只做最后一次模板更新即可
            this._updateCount = 0;
            return this.__update();
        }

        return this.element;       
    }

    _patchProps(lastProps, nextProps) {
        lastProps = lastProps || EMPTY_OBJ;
        nextProps = nextProps || EMPTY_OBJ;
        let lastValue;
        let nextValue;
        if (lastProps !== nextProps) {
            // 需要先处理事件，因为prop变更可能触发相应的事件
            let lastPropsWithoutEvents;
            let nextPropsWithoutEvents;
            if (nextProps !== EMPTY_OBJ) {
                for (let prop in nextProps) {
                    nextValue = nextProps[prop];
                    if (isEventProp(prop)) {
                        this.set(prop, nextValue, {silent: true});
                        lastValue = lastProps[prop];
                        if (isFunction(nextValue)) {
                            // 更换事件监听函数
                            let eventName = prop.substr(3);
                            if (isFunction(lastValue)) {
                                this.off(eventName, lastValue);
                            }
                            this.on(eventName, nextValue);
                        } else if (isFunction(lastValue)) {
                            // 解绑事件监听函数
                            this.off(prop.substr(3), lastValue);
                        }
                    } else {
                        if (!nextPropsWithoutEvents) {
                            nextPropsWithoutEvents = {};
                        }
                        nextPropsWithoutEvents[prop] = nextValue;
                    }
                }
                if (lastProps !== EMPTY_OBJ) {
                    for (let prop in lastProps) {
                        if (!hasOwn.call(nextProps, prop)) {
                            lastValue = lastProps[prop];
                            if (isEventProp(prop) && isFunction(lastValue)) {
                                this.set(prop, undefined, {global: false});
                                // 如果是事件，则要解绑事件
                                this.off(prop.substr(3), lastValue);
                            } else {
                                if (!lastPropsWithoutEvents) {
                                    lastPropsWithoutEvents = {};
                                }
                                lastPropsWithoutEvents[prop] = lastValue;
                            }
                        }
                    }
                }

                if (nextPropsWithoutEvents) {
                    this.set(nextPropsWithoutEvents, {global: false});
                }
            } else {
                for (let prop in lastProps) {
                    lastValue = lastProps[prop];
                    if (isEventProp(prop) && isFunction(lastValue)) {
                        this.set(prop, undefined, {silent: true});
                        // 如果是事件，则要解绑事件
                        this.off(prop.substr(3), lastValue);
                    } else {
                        if (!lastPropsWithoutEvents) {
                            lastPropsWithoutEvents = {};
                        }
                        lastPropsWithoutEvents[prop] = lastValue;
                    }
                }
            }

            // 将不存在nextProps中，但存在lastProps中的属性，统统置为空
            if (lastPropsWithoutEvents) {
                for (let prop in lastPropsWithoutEvents) {
                    this.set(prop, undefined, {global: false});
                }
            }
        }
    }

    destroy(lastVNode, nextVNode) {
        this.off();
        this._destroy(lastVNode, nextVNode);
    }

    get(key, defaultValue) {
        if (key === undefined) return this.props;

        return get(this.props, key, defaultValue);
    }

    set(key, val, options) {
        if (isNullOrUndefined(key)) return this;

        let current = this.props,
            changes = [];

        if (typeof key === 'object') {
            options = val;
            for (let attr in key) {
                val = key[attr];
                if (!isEqual(current[attr], val)) {
                    changes.push(attr);
                }
                current[attr] = val;
            }
        } else {
            // support set value by path like 'a.b.c'
            if (!isEqual(get(current, key), val)) {
                let path = castPath(key);
                // trigger `change:a.b.c` and `change:a` events
                changes.push(key);
                if (path.length > 1) changes.push(path[0]);
            }
            set(current, key, val);
        }

        options = extend({
            silent: false,
            global: true,
            async: false
        }, options);

        if (changes.length) {
            // trigger `change` event
            for (let i = 0, l = changes.length; i < l; i++) {
                let attr = changes[i],
                    value = get(current, attr),
                    eventName = `change:${attr}`;
                options[eventName] && options[eventName].call(this, value);
                !options.silent && this.trigger(eventName, this, value);
            }

            if (options.change) options.change.call(this, changes);
            if (!options.silent) {
                this.trigger('beforeChange', this, changes);
                if (options.global) {
                    clearTimeout(this._asyncUpdate);
                    let triggerChange = () => {
                        this.trigger('change', this, changes);
                        // trigger `changed` event
                        for (let i = 0, l = changes.length; i < l; i++) {
                            let attr = changes[i],
                                value = get(current, attr),
                                eventName = `changed:${attr}`;

                            if (options[eventName]) options[eventName].call(this, value);
                            this.trigger(eventName, this, value);
                        }
                    };
                    if (options.async) {
                        this._asyncUpdate = setTimeout(triggerChange);
                    } else {
                        triggerChange();
                    }
                }
            }
        }

        return this;
    }

    on(name, callback) {
        (this._events[name] || (this._events[name] = [])).push(callback);

        return this;
    }

    one(name, callback) {
        const fn = (...args) => {
            callback.apply(this, args); 
            this.off(name, fn);
        };
        this.on(name, fn);

        return this;
    }

    off(name, callback) {
        if (name === undefined) {
            this._events = {};
            return this;
        }

        let callbacks = this._events[name];
        if (!callbacks) return this;

        if (callback === undefined) {
            delete this._events[name];
            return this;
        }

        for (let cb, i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === callback) {
                callbacks.splice(i, 1);
                i--;
            }
        }

        return this;
    }

    trigger(name, ...args) {
        let callbacks = this._events[name];

        if (callbacks) {
            for (let i = 0, l = callbacks.length; i < l; i++) {
                callbacks[i].apply(this, args);
            }
        }

        return this;
    }
}

/**
 * @brief 继承某个组件
 *
 * @param prototype
 */
Intact.extend = function(prototype = {}) {
    prototype.defaults = extend({}, this.prototype.defaults, prototype.defaults);
    return inherit(this, prototype);
};

/**
 * 挂载组件到dom中
 * @param widget {Intact} Intact类或子类，也可以是实例化的对象
 * @param node {Node} html节点
 */
Intact.mount = function(widget, node) {
    if (widget.prototype && (widget.prototype instanceof Intact || widget === Intact)) {
        widget = new widget();
    }
    if (widget.rendered) {
        node.appendChild(widget.element);
    } else if (widget.inited) {
        node.appendChild(widget.init()); 
    } else {
        widget.one('inited', () => node.appendChild(widget.init()));
    }
    return widget;
};
