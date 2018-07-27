import Intact from './constructor';
import {hc, render, h} from 'misstime';
import {removeComponentClassOrInstance} from 'misstime/src/vdom';
import {Types, EMPTY_OBJ} from 'misstime/src/vnode';
import {warn, error, isFunction, hasOwn, result, noop} from '../utils';
import {MountedQueue, isEventProp} from 'misstime/src/utils';

Intact._constructors.push(function() {
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

    if (!nextVNode && !fromPending && this._updateCount === 0) {
        // 如果直接调用update方法，则要清除mountedQueue
        // 如果在render的过程中，又触发了update，则此时
        // 不能清空
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

export default function patchProps(o, lastProps, nextProps, options = {update: false, _fromPatchProps: true}) {
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
                    o.set(prop, nextValue, {silent: true});
                    lastValue = lastProps[prop];
                    
                    if (isFunction(nextValue)) {
                        // 更换事件监听函数
                        let eventName = prop.substr(3);
                        if (isFunction(lastValue)) {
                            o.off(eventName, lastValue);
                        }
                        o.on(eventName, nextValue);
                    } else if (isFunction(lastValue)) {
                        // 解绑事件监听函数
                        o.off(prop.substr(3), lastValue);
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
                            o.set(prop, undefined, {silent: true});
                            // 如果是事件，则要解绑事件
                            o.off(prop.substr(3), lastValue);
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
                o.set(nextPropsWithoutEvents, options);
            }
        } else {
            for (let prop in lastProps) {
                lastValue = lastProps[prop];

                if (isEventProp(prop) && isFunction(lastValue)) {
                    o.set(prop, undefined, {silent: true});
                    // 如果是事件，则要解绑事件
                    o.off(prop.substr(3), lastValue);
                } else {
                    if (!lastPropsWithoutEvents) {
                        lastPropsWithoutEvents = {};
                    }
                    lastPropsWithoutEvents[prop] = lastValue;
                }
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
