import Intact from './constructor';
import {hc, render, h} from 'misstime/src';
import {removeComponentClassOrInstance} from 'misstime/src/vdom';
import {Types, EMPTY_OBJ} from 'misstime/src/vnode';
import {warn, error, isFunction, hasOwn, result, noop, isArray, each} from '../utils';
import {MountedQueue, isEventProp} from 'misstime/src/utils';
import validateProps from './validate-props';

Intact._constructors.push(function(props) {
    // lifecycle states
    this.inited = false;
    this.rendered = false;
    this.mounted = false;
    this.destroyed = false;

    // if the flag is false, any set operation will not lead to update 
    this._startRender = false;

    this._updateCount = 0;
    this._pendingUpdate = null;

    this.mountedQueue = null;

    const inited = () => {
        this.inited = true;

        // trigger $receive event when initialize component
        each(props, (value, key) => {
            this.trigger(`$receive:${key}`, this, value);
        });
        this.trigger('$inited', this);
    };
    const ret = this._init();

    if (ret && ret.then) {
        ret.then(inited, err => {
            error('Unhandled promise rejection in _init: ', err);
            inited();
        });
    } else {
        inited();
    }
});

Intact.prototype._init = noop;
Intact.prototype._create = noop;
Intact.prototype._mount = noop;
Intact.prototype._beforeUpdate = noop;
Intact.prototype._update = noop;
Intact.prototype._destroy = noop;


Intact.prototype.init = function(lastVNode, nextVNode) {
    this._lastVNode = lastVNode;
    if (!this.inited) {
        return initAsyncComponnet(this, lastVNode, nextVNode);
    }
    return initSyncComponent(this, lastVNode, nextVNode);
};

Intact.prototype.mount = function(lastVNode, nextVNode) {
    // 异步组件，直接返回
    if (!this.inited) return;
    this.mounted = true;
    this.trigger('$mounted', this);
    this._mount(lastVNode, nextVNode);
};

Intact.prototype.update = function(lastVNode, nextVNode, fromPending) {
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

    // mountedQueue在一次更新周期里，只能使用使用，根据done字段判断
    // 在同一更新周期里，共用该对象，否则置为null，让misstime自己去重新初始化
    if (this.mountedQueue && this.mountedQueue.done) {
        this.mountedQueue = null;
    }

    // 如果不存在nextVNode，则为直接调用update方法更新自己
    // 否则则是父组件触发的子组件更新，此时需要更新一些状态
    // 有一种情况，在父组件初次渲染时，子组件渲染过程中，
    // 又触发了父组件的数据变更，此时父组件渲染完成执行_pendingUpdate
    // 是没有lastVNode的
    if (nextVNode && lastVNode) {
        patchProps(this, lastVNode.props, nextVNode.props);
    }

    ++this._updateCount;
    if (this._updateCount > 1) {
        return this.element;
    }
    if (this._updateCount === 1) {
        return updateComponent(this, lastVNode, nextVNode);
    }
};

Intact.prototype.destroy = function(lastVNode, nextVNode, parentDom) {
    if (this.destroyed) {
        return warn('destroyed multiple times');
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
    } else if (
        !nextVNode || 
        !(nextVNode.type & Types.ComponentClassOrInstance) ||
        nextVNode.key !== lastVNode.key
    ) {
        vdt.destroy();
    }

    // 如果存在nextVNode，并且nextVNode也是一个组件类型，
    // 并且，它俩的key相等，则不去destroy，而是在下一个组件init时
    // 复用上一个dom，然后destroy上一个元素
    this._destroy(lastVNode, nextVNode);
    this.destroyed = true;
    this.trigger('$destroyed', this);
    this.off();
};

Intact.prototype._initMountedQueue = function() {
    this.mountedQueue = new MountedQueue();
};

Intact.prototype._triggerMountedQueue = function() {
    this.mountedQueue.trigger();
};


function initSyncComponent(o, lastVNode, nextVNode) {
    const vdt = o.vdt;

    o._startRender = true;
    // 如果key不相同，则不复用dom，直接返回新dom来替换
    if (lastVNode && lastVNode.key === nextVNode.key) {
        // destroy the last component
        if (!lastVNode.children.destroyed) {
            removeComponentClassOrInstance(lastVNode, null, nextVNode);
        }
    
        // make the dom not be replaced, but update the last one
        vdt.vNode = lastVNode.children.vdt.vNode;
        o.element = vdt.update(
            o, o.parentDom, o.mountedQueue,
            nextVNode, o.isSVG,
            o.get('_blocks')
        );
    } else {
        if (lastVNode) {
            removeComponentClassOrInstance(lastVNode, null, nextVNode);
        }
        o.element = vdt.render(
            o, o.parentDom, o.mountedQueue, 
            nextVNode, o.isSVG,
            o.get('_blocks')
        );
    }
    o.rendered = true;
    if (o._pendingUpdate) {
        o._pendingUpdate(lastVNode, nextVNode);
        o._pendingUpdate = null;
    }
    o.trigger('$rendered', o);
    o._create(lastVNode, nextVNode);

    return o.element;
}

function initAsyncComponnet(o, lastVNode, nextVNode) {
    const vdt = o.vdt;
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
    o.one('$inited', () => {
        // 异步组件进入了新的更新周期，需要初始化mountedQueue
        o._initMountedQueue();
        const element = o.init(lastVNode, nextVNode);
        const dom = nextVNode.dom;
        // 存在一种情况，组件的返回的元素是一个组件，他们指向同一个dom
        // 但是当嵌套组件的dom变更时，父组件的vNode却没有变
        // 所以这里强制保持一致
        nextVNode.dom = element;
        if (!lastVNode || lastVNode.key !== nextVNode.key) {
            dom.parentNode.replaceChild(element, dom);
        }
        o._triggerMountedQueue();
        o.mount(lastVNode, nextVNode);
    });

    vdt.node = placeholder;

    return placeholder;
}

function updateComponent(o, lastVNode, nextVNode) {
    o._beforeUpdate(lastVNode, nextVNode);
    // 直接调用update方法，保持parentVNode不变
    o.element = o.vdt.update(
        o, o.parentDom, o.mountedQueue,
        nextVNode || o.vNode, o.isSVG,
        o.get('_blocks')
    );
    // 让整个更新完成，才去触发_update生命周期函数
    if (o.mountedQueue) {
        o.mountedQueue.push(() => {
            o._update(lastVNode, nextVNode);
        });
    } else {
        o._update(lastVNode, nextVNode);
    }
    if (--o._updateCount > 0) {
        // 如果更新完成，发现还有更新，则是在更新过程中又触发了更新
        // 此时直接将_updateCount置为1，因为所有数据都已更新，只做最后一次模板更新即可
        // --o._updateCount会将该值设为0，所以这里设为1
        o._updateCount = 1;
        return updateComponent(o, lastVNode, nextVNode);
    }

    // 组件模板可能根据情况返回不同的dom，这种情况下，当组件自身更新(即：直接调用update)
    // 组件的dom可能变更了，但是当前组件的vNode的dom属性却不会变更，此后该dom如果被v-if
    // 指令删除，会报错
    // 所以这里要强制更新
    let vNode = o.vNode;
    if (vNode) {
        // 有可能直接new组件，所以这里判断vNode是否存在
        let lastDom = vNode.dom;    
        let nextDom = o.element;
        if (lastDom !== nextDom) {
            vNode.dom = nextDom;
            let parentVNode = vNode.parentVNode;
            // 需要递归判断父组件是不是也指向同一个元素
            while (
                parentVNode &&
                (parentVNode.type & Types.ComponentClassOrInstance) &&
                parentVNode.dom === lastDom
            ) {
                parentVNode.dom = nextDom;
                parentVNode = parentVNode.parentVNode;
            }
        }
    }

    return o.element;       
}

export function patchProps(o, lastProps, nextProps, options = {update: false, _fromPatchProps: true}) {
    lastProps = lastProps || EMPTY_OBJ;
    nextProps = nextProps || EMPTY_OBJ;
    let lastValue;
    let nextValue;

    if (lastProps !== nextProps) {
        // 需要先处理事件，因为prop变更可能触发相应的事件
        let lastPropsWithoutEvents;
        let nextPropsWithoutEvents;

        // 如果该属性只存在lastProps中，则是事件就解绑；
        // 是属性就加入lastPropsWithoutEvents对象，待会儿再处理
        const handlePropOnlyInLastProps = (prop) => {
            const lastValue = lastProps[prop];

            if (isEventProp(prop)) {
                // 解绑上一个属性中的事件
                removeEvents(o, prop, lastValue);
            } else {
                if (!lastPropsWithoutEvents) {
                    lastPropsWithoutEvents = {};
                }
                lastPropsWithoutEvents[prop] = lastValue;
            }
        };

        if (nextProps !== EMPTY_OBJ) {
            if (process.env.NODE_ENV !== 'production') {
                validateProps(nextProps, o.constructor.propTypes, o.displayName || o.constructor.name);
            }

            for (let prop in nextProps) {
                nextValue = nextProps[prop];

                if (isEventProp(prop)) {
                    lastValue = lastProps[prop];
                    if (lastValue === nextValue) continue;

                    patchEventProps(o, prop, lastValue, nextValue);
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
                        handlePropOnlyInLastProps(prop);
                    }
                }
            }

            if (nextPropsWithoutEvents) {
                o.set(nextPropsWithoutEvents, options);
            }
        } else {
            for (let prop in lastProps) {
                handlePropOnlyInLastProps(prop);
            }
        }

        // 将不存在nextProps中，但存在lastProps中的属性，统统置为默认值
        const defaults = result(o, 'defaults') || EMPTY_OBJ; 
        if (lastPropsWithoutEvents) {
            for (let prop in lastPropsWithoutEvents) {
                o.set(prop, defaults[prop], options);
            }
        }
    }
}

/**
 * @brief diff事件属性，属性值可以是空、函数、数组，为了保证事件属性执行顺序优先于
 * 组件内部绑定的同名事件，这里采用unshift倒着处理
 *
 * @param o
 * @param prop
 * @param lastValue
 * @param nextValue
 *
 * @return 
 */
function patchEventProps(o, prop, lastValue, nextValue) {
    o.set(prop, nextValue, {silent: true});
    const eventName = prop.substr(3);
    
    if (isArray(nextValue)) {
        if (isArray(lastValue)) {
            // 由于实际应用中，nextValue和lastValue一般长度相等，
            // 而且顺序也不会变化，极有可能仅仅只是改变了数组中
            // 的一项或几项，所以可以一一对比处理
            const nextLength = nextValue.length;
            const lastLength = lastValue.length; 
            let i;
            const l = Math.min(nextLength, lastLength);
            if (l < nextLength) {
                // 如果nextValue > lastValue
                // 则绑定剩下的事件函数
                for (i = nextLength - 1; i >= l; i--) {
                    const _nextValue = nextValue[i];
                    if (_nextValue) {
                        o.on(eventName, _nextValue, {unshift: true});
                    }
                }
            } else if (l < lastLength) {
                // 如果nextValue < lastValue
                // 则解绑剩下的事件函数
                for (i = lastLength - 1; i >= l; i--) {
                    const _lastValue = lastValue[i];
                    if (_lastValue) {
                        o.off(eventName, _lastValue);
                    }
                }
            }
            for (i = l - 1; i >= 0; i--) {
                const _lastValue = lastValue[i];
                const _nextValue = nextValue[i];
                // 因为要保证顺序不变，所以即使相同，也要重新unshift到前面
                // if (_lastValue !== _nextValue) {
                    if (_lastValue) {
                        o.off(eventName, _lastValue);
                    }
                    if (_nextValue) {
                        o.on(eventName, _nextValue, {unshift: true});
                    }
                // }
            } 
        } else if (lastValue) {
            o.off(eventName, lastValue);
            for (let i = nextValue.length - 1; i >= 0; i--) {
                const _nextValue = nextValue[i];
                if (_nextValue) {
                    o.on(eventName, _nextValue, {unshift: true})
                }
            }
        } else {
            for (let i = nextValue.length - 1; i >= 0 ; i--) {
                const _nextValue = nextValue[i];
                if (_nextValue) {
                    o.on(eventName, _nextValue, {unshift: true});
                }
            }
        }
    } else if (nextValue) {
        if (isArray(lastValue)) {
            let found = false;
            for (let i = 0; i < lastValue.length; i++) {
                const _lastValue= lastValue[i];
                if (_lastValue) {
                    if (_lastValue !== nextValue) {
                        o.off(eventName, _lastValue)
                    } else {
                        found = true;
                    }
                }
            }
            // 如果下一个事件函数不在上一个数组中，则绑定
            if (!found) {
                o.on(eventName, nextValue, {unshift: true});
            }
        } else if (lastValue) {
            o.off(eventName, lastValue);
            o.on(eventName, nextValue, {unshift: true});
        } else {
            o.on(eventName, nextValue, {unshift: true});
        }
    } else {
        removeEvents(o, prop, lastValue);
    }
}

function removeEvents(o, prop, value) {
    let eventName;
    if (isArray(value)) {
        eventName = prop.substr(3);
        for (let i = 0; i < value.length; i++) {
            const v = value[i];
            if (v) {
                o.off(eventName, v);
            }
        }
    } else if (value) {
        eventName = prop.substr(3);
        o.off(eventName, value);
    }
    o.set(prop, undefined, {silent: true});
}
