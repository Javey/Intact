import {
    inherit, extend, result, each, isFunction, 
    isEqual, uniqueId, get, set, castPath, hasOwn,
    keys, isObject, isString, NextTick
} from './utils';
import Vdt from 'vdt';
import {hc, render, hydrateRoot, h} from 'misstime';
import {removeComponentClassOrInstance} from 'misstime/src/vdom';
import {EMPTY_OBJ} from 'misstime/src/vnode';
import {isNullOrUndefined, isEventProp, MountedQueue} from 'misstime/src/utils';

export default function Intact(props) {
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

    // for string ref
    this.refs = this.widgets;

    this.uniqueId = this._widget;

    this.inited = false;
    this.rendered = false;
    this.mounted = false;
    this.destroyed = false;

    // if the flag is false, every set operation will not lead to update 
    this._startRender = false;

    // for debug
    this.displayName = this.displayName;

    this.addEvents();

    this._updateCount = 0;

    const inited = () => {
        this.inited = true;
        this.trigger('$inited', this);
    };
    const ret = this._init();
    if (ret && ret.then) {
        ret.then(inited, err => {
            console.warn('Unhandled promise rejection in _init: ', err);
            inited();
        });
    } else {
        inited();
    }
}

Intact.prototype = {
    constructor: Intact,

    defaults() {},

    addEvents(props = this.props) {
        each(props , (value, key) => {
            if (isEventProp(key) && isFunction(value)) {
                this.on(key.substr(3), value);
            }
        });
    },

    _init(props) {},
    _create(lastVNode, nextVNode) {},
    _mount(lastVNode, nextVNode) {},
    _beforeUpdate(lastVNode, nextVNode) {},
    _update(lastVNode, nextVNode) {},
    _destroy(lastVNode, nextVNode, parentDom) {},

    hydrate(vNode, dom) {
        const vdt = this.vdt;
        if (!this.inited) {
            this.one('$inited', () => {
                const element = this.hydrate(vNode, dom);
                if (dom !== element) {
                    vNode.dom = element;
                }
                this._triggerMountedQueue();
                this.mount(null, vNode);
            });

            return dom;
        }

        this._startRender = true;
        this.element = vdt.hydrate(
            this, dom, this.mountedQueue, 
            this.parentDom, vNode, this.isSVG,
            this.get('_blocks')
        );
        this.rendered = true;
        this.trigger('$rendered', this);
        this._create(null, vNode);

        return this.element;
    },

    init(lastVNode, nextVNode) {
        const vdt = this.vdt;
        this._lastVNode = lastVNode;
        if (!this.inited) {
            // 支持异步组件
            let placeholder;
            if (lastVNode) {
                placeholder = lastVNode.dom;
                const lastInstance = lastVNode.children;
                vdt.vNode = lastInstance.vdt.vNode;
                // 如果上一个组件是异步组件，并且也还没渲染完成，则直接destroy掉
                // 让它不再渲染了
                if (!lastInstance.inited) {
                    removeComponentClassOrInstance(lastVNode, null, nextVNode);
                }
            } else {
                const vNode = hc('!');
                placeholder = render(vNode);
                vdt.vNode = vNode;
            }
            // 组件销毁事件也会解绑，所以这里无需判断组件是否销毁了
            this.one('$inited', () => {
                const element = this.init(lastVNode, nextVNode);
                const dom = nextVNode.dom;
                // 存在一种情况，组件的第一个元素是一个组件，他们管理的是同一个dom
                // 但是当第一个元素的dom变更时，父组件的vNode却没有变
                // 所以这里强制保持一致
                nextVNode.dom = element;
                if (!lastVNode || lastVNode.key !== nextVNode.key) {
                    dom.parentNode.replaceChild(element, dom);
                }
                this._triggerMountedQueue();
                this.mount(lastVNode, nextVNode);
            });
            vdt.node = placeholder;
            return placeholder;
        }

        this._startRender = true;
        // 如果key不相同，则不复用dom，直接返回新dom来替换
        if (lastVNode && lastVNode.key === nextVNode.key) {
            // destroy the last component
            if (!lastVNode.children.destroyed) {
                removeComponentClassOrInstance(lastVNode, null, nextVNode);
            }
        
            // make the dom not be replaced, but update the last one
            vdt.vNode = lastVNode.children.vdt.vNode;
            this.element = vdt.update(
                this, this.parentDom, this.mountedQueue,
                nextVNode, this.isSVG,
                this.get('_blocks')
            );
        } else {
            if (lastVNode) {
                removeComponentClassOrInstance(lastVNode, null, nextVNode);
            }
            this.element = vdt.render(
                this, this.parentDom, this.mountedQueue, 
                nextVNode, this.isSVG,
                this.get('_blocks')
            );
        }
        this.rendered = true;
        if (this._pendingUpdate) {
            this._pendingUpdate(lastVNode, nextVNode);
            this._pendingUpdate = null;
        }
        this.trigger('$rendered', this);
        this._create(lastVNode, nextVNode);

        return this.element;
    },

    toString() {
        return this.vdt.renderString(this, this.get('_blocks')); 
    },

    mount(lastVNode, nextVNode) {
        // 异步组件，直接返回
        if (!this.inited) return;
        this.mounted = true;
        this.trigger('$mounted', this);
        this._mount(lastVNode, nextVNode);
    },

    update(lastVNode, nextVNode, fromPending) {
        // 如果该组件已被销毁，则不更新
        // 组件的销毁顺序是从自下而上逐步销毁的，对于子组件，即使将要销毁也要更新
        // 只有父组件被销毁了才不去更新，父组件的更新是没有vNode参数
        if (!lastVNode && !nextVNode && this.destroyed) {
            return lastVNode ? lastVNode.dom : undefined;
        }
        // 如果还没有渲染，则等待结束再去更新
        if (!this.rendered) {
            this._pendingUpdate = function(lastVNode, nextVNode) {
                this.update(lastVNode, nextVNode, true);
            };
            return lastVNode ? lastVNode.dom : undefined;
        }

        if (!nextVNode && !fromPending && this._updateCount === 0) {
            // 如果直接调用update方法，则要清除mountedQueue
            // 如果在render的过程中，又触发了update，则此时
            // 不能清空
            this.mountedQueue = null;
        }

        ++this._updateCount;
        if (this._updateCount > 1) return this.element;
        if (this._updateCount === 1) return this.__update(lastVNode, nextVNode);
    },

    __update(lastVNode, nextVNode) {
        // 如果不存在nextVNode，则为直接调用update方法更新自己
        // 否则则是父组件触发的子组件更新，此时需要更新一些状态
        // 有一种情况，在父组件初次渲染时，子组件渲染过程中，
        // 又触发了父组件的数据变更，此时父组件渲染完成执行_pendingUpdate
        // 是没有lastVNode的
        if (nextVNode && lastVNode) {
            this._patchProps(lastVNode.props, nextVNode.props);
        }

        this._beforeUpdate(lastVNode, nextVNode);
        // 直接调用update方法，保持parentVNode不变
        this.element = this.vdt.update(
            this, this.parentDom, this.mountedQueue,
            nextVNode || this.parentVNode, this.isSVG,
            this.get('_blocks')
        );
        // 让整个更新完成，才去触发_update生命周期函数
        if (this.mountedQueue) {
            this.mountedQueue.push(() => {
                this._update(lastVNode, nextVNode);
            });
        } else {
            this._update(lastVNode, nextVNode);
        }
        if (--this._updateCount > 0) {
            // 如果更新完成，发现还有更新，则是在更新过程中又触发了更新
            // 此时直接将_updateCount置为1，因为所有数据都已更新，只做最后一次模板更新即可
            // --this._updateCount会将该值设为0，所以这里设为1
            this._updateCount = 1;
            return this.__update();
        }

        return this.element;       
    },

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
                }

                if (nextPropsWithoutEvents) {
                    this.set(nextPropsWithoutEvents, {update: false});
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

            // 将不存在nextProps中，但存在lastProps中的属性，统统置为默认值
            const defaults = result(this, 'defaults');
            if (lastPropsWithoutEvents) {
                for (let prop in lastPropsWithoutEvents) {
                    this.set(prop, defaults[prop], {update: false});
                }
            }
        }
    },

    destroy(lastVNode, nextVNode, parentDom) {
        if (this.destroyed) {
            return console.warn('destroyed multiple times');
        }
        const vdt = this.vdt;
        // 异步组件，可能还没有渲染
        if (!this.rendered) {
            // 异步组件，只有开始渲染时才销毁上一个组件
            // 如果没有渲染当前异步组件就被销毁了，则要
            // 在这里销毁上一个组件
            const _lastVNode = this._lastVNode;
            if (_lastVNode && !_lastVNode.children.destroyed) {
                removeComponentClassOrInstance(_lastVNode, null, lastVNode);
            }
        } else if (!nextVNode || nextVNode.key !== lastVNode.key) {
            vdt.destroy();
        }
        this._destroy(lastVNode, nextVNode);
        this.destroyed = true;
        this.trigger('$destroyed', this);
        this.off();
    },

    // function name conflict with utils.get
    get: function _get(key, defaultValue) {
        if (key === undefined) return this.props;

        return get(this.props, key, defaultValue);
    },

    set: function _set(key, val, options) {
        if (isNullOrUndefined(key)) return this;

        let isSetByObject = false;
        if (typeof key === 'object') {
            options = val;
            isSetByObject = true;
        }
        options = extend({
            silent: false,
            update: true,
            async: false
        }, options);
        // 兼容老版本
        if (hasOwn.call(options, 'global')) {
            options.update = options.global;
        }

        const props = this.props;
        const changes = {};

        let hasChanged = false;

        // 前面做了undefined的判断，这里不可能为undefined了
        if (isSetByObject) {
            if (!options.silent) {
                for (let prop in key) {
                    let nextValue = key[prop];
                    let lastValue = props[prop];
                    if (!isEqual(lastValue, nextValue)) {
                        changes[prop] = [lastValue, nextValue];
                        hasChanged = true;
                    }
                    // 即使相等，也要重新复制，因为有可能引用地址变更
                    props[prop] = nextValue;
                }
            } else {
                // 如果静默更新，则直接赋值
                extend(props, key);
            }
        } else {
            if (!options.silent) {
                let lastValue = get(props, key);
                if (!isEqual(lastValue, val)) {
                    if (!hasOwn.call(props, key)) {
                        changes[key] = [lastValue, val];
                        let path = castPath(key);
                        // 如果是像'a.b.c'这样设置属性，而该属性不存在
                        // 依次触发change:a.b.c、change:a.b、change:a这样的事件
                        // 先不设置props，去取老值
                        let _props = [];
                        for (let i = path.length - 1; i > 0; i--) {
                            let prop = path.slice(0, i).join('.');
                            let _lastValue = get(props, prop);
                            changes[prop] = [_lastValue];
                            _props.push(prop);
                        }
                        // 设置props后，去取新值
                        // 对于引用数据类型，新老值可能一样
                        set(props, key, val);
                        for (let i = 0; i < _props.length; i++) {
                            let prop = _props[i];
                            changes[prop].push(get(props, prop));
                        }
                    } else {
                        // 否则，只触发change:a.b.c
                        changes[key] = [lastValue, val];
                        set(props, key, val);
                    }

                    hasChanged = true;
                } else {
                    set(props, key, val);
                }
            } else {
                set(props, key, val);
            }
        }

        if (hasChanged) {
            // trigger `change*` events
            for (let prop in changes) {
                let values = changes[prop];
                this.trigger(`$change:${prop}`, this, values[1], values[0]);
            }
            const changeKeys = keys(changes);

            this.trigger('$change', this, changeKeys);

            if (options.update && this._startRender) {
                const triggerChange = (changes, changeKeys) => {
                    this.update();
                    this._triggerChangedEvent(changes, changeKeys);
                };
                if (options.async) {
                    if (!this._$nextTick) {
                        this._$nextTick = new NextTick(function(data) {
                            // 将每次改变的属性放入数组
                            this.args.push(data);
                        });
                        this._$nextTick.args = [];
                    }
                    let self = this;
                    this._$nextTick.fire(function() {
                        // 合并执行更新后，触发所有$changed事件
                        const args = this.args;
                        let changes = {};
                        for (let i = 0; i < args.length; i++) {
                            extend(changes, args[i]); 
                        }
                        self._$nextTick = null;
                        triggerChange(changes, keys(changes));
                    }, changes);
                } else {
                    triggerChange(changes, changeKeys);
                }
            } else if (this.mountedQueue && this._startRender) {
                // 如果是父组件导致子组件更新，此时存在mountedQueue
                // 则在组件数更新完毕，触发$changed事件
                this.mountedQueue.push(() => {
                    this._triggerChangedEvent(changes, changeKeys);
                });
            }
        }

        return this;
    },

    on(name, callback) {
        (this._events[name] || (this._events[name] = [])).push(callback);

        return this;
    },

    one(name, callback) {
        const fn = (...args) => {
            callback.apply(this, args); 
            this.off(name, fn);
        };
        this.on(name, fn);

        return this;
    },

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
    },

    trigger(name, ...args) {
        let callbacks = this._events[name];

        if (callbacks) {
            callbacks = callbacks.slice();
            for (let i = 0, l = callbacks.length; i < l; i++) {
                callbacks[i].apply(this, args);
            }
        }

        return this;
    },

    _initMountedQueue() {
        this.mountedQueue = new MountedQueue();
    },

    _triggerMountedQueue() {
        this.mountedQueue.trigger();
    },

    _triggerChangedEvent(changes, changeKeys) {
        for (let prop in changes) {
            let values = changes[prop];
            this.trigger(`$changed:${prop}`, this, values[1], values[0]);
        }
        this.trigger('$changed', this, changeKeys);
    }
};

/**
 * @brief 继承某个组件
 *
 * @param prototype
 */
Intact.extend = function(prototype = {}) {
    if (typeof this.prototype.defaults === 'object' && typeof prototype.defaults === 'object') {
        prototype.defaults = extend({}, this.prototype.defaults, prototype.defaults);
    }
    return inherit(this, prototype);
};

/**
 * 挂载组件到dom中
 * @param Component {Intact} Intact类或子类
 * @param node {Node} html节点
 */
Intact.mount = function(Component, node) {
    if (!node) throw new Error(`expect a parent dom to mount Component, but got ${node}`);
    const vNode = h(Component);
    const mountedQueue = new MountedQueue();
    render(vNode, node, mountedQueue);
    const instance = vNode.children;
    // 如果不是异步组件，则触发mount事件，否则
    // 交给组件的init方法，等异步处理完成后触发
    if (instance.inited) {
        mountedQueue.trigger();
    }
    return instance;
};

Intact.hydrate = function(Component, node) {
    if (!node) throw new Error(`expect a parent dom to hydrate Component, but got ${node}`);
    const vNode = h(Component);
    hydrateRoot(vNode, node);
    return vNode.children;
};

// ES7 Decorator for template
if (Object.defineProperty) {
    Intact.template = function(options) {
        return function(target, name, descriptor) {
            let template = target.template;
            if (isString(template)) {
                template = Vdt.compile(template, options);
            }
            const Parent = Object.getPrototypeOf(target);
            const _super = function(...args) {
                return Parent.template.apply(this, args);
            }; 
            descriptor.get = function() {
                return function(...args) {
                    const self = this || {};
                    const __super = self._super;
                    let returnValue;

                    self._super = _super;
                    returnValue = template.apply(this, args);
                    self._super = __super;

                    return returnValue;
                };
            };
        }
    }
}
