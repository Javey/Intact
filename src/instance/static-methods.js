import Intact from './constructor';
import {inherit, extend} from '../utils';
import {h, render, hydrateRoot} from 'misstime/src';
import {MountedQueue} from 'misstime/src/utils';
import {VNode} from 'misstime/src/vnode';

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

// for type check
Intact.VNode = VNode;
