import React from 'react';
// for webpack alias Intact to IntactReact
import Intact from 'intact/dist';
import {normalizeProps, normalizeChildren} from './normalize'
import functionalWrapper, {noop, isArray} from './functionalWrapper';
import FakePromise from './FakePromise';
import {commentNodeValue} from './Wrapper';
import {rewriteParentElementApi} from './Wrapper';

const {isObject, extend} = Intact.utils;
const {h, config} = Intact.Vdt.miss;

// disable delegate events
if (config) {
    config.disableDelegate = true;
}

let internalInstanceKey;
let internalEventHandlersKey;
let promises = [];

class IntactReact extends Intact {
    static functionalWrapper = functionalWrapper;

    static normalize = normalizeChildren;

    static $$cid = 'IntactReact';

    constructor(props, context) {
        // React will pass context to constructor
        if (context) {
            const parentRef = {};
            const normalizedProps = normalizeProps(props, context, parentRef);
            super(normalizedProps);
            parentRef.instance = this;

            this.__promises = context.__promises || promises;
            this.mountedQueue = context.__parent && context.__parent.mountedQueue;

            // fake the vNode
            this.vNode = h(this.constructor, normalizedProps);
            this.vNode.children = this;

            // We must keep the props to be undefined,
            // otherwise React will think it has mutated
            this._props = this.props;
            delete this.props;
            this._isReact = true;
        } else {
            super(props);
        }

        this._triggerFlagStack = [];

        let element;
        Object.defineProperty(this, 'element', {
            get() {
                if (!this.__isUpdating && element && element.nodeType === 8 && element.nodeValue === commentNodeValue) {
                    return element._realElement || element;
                }
                return element;
            },
            set(v) {
                element = v;
            },
            configurable: true,
            enumerable: true,
        });
    }

    _update(lastVNode, nextVNode) {
        if (this.destroyed) return;
        super._update(lastVNode, nextVNode);
    }

    getChildContext() {
        return {
            __parent: this,
            __promises: this.__promises,
        };
    }

    get(...args) {
        if (this._isReact) {
            const props = this.props;
            this.props = this._props;
            const result = super.get(...args);
            this.props = props;
            return result;
        } else {
            return super.get(...args);
        }
    }

    set(...args) {
        if (this._isReact) {
            const props = this.props;
            this.props = this._props;
            const result = super.set(...args);
            this.props = props;
            return result;
        } else {
            return super.set(...args);
        }
    }

    init(lastVNode, nextVNode) {
        // react has changed the refs, so we reset it back
        const __isUpdating = this.__isUpdating;
        this.__isUpdating = true;
        this.refs = this.vdt.widgets || {};
        this.__pushGetChildContext(nextVNode);
        const element = super.init(lastVNode, nextVNode);
        this.__popGetChildContext();
        this.__isUpdating = __isUpdating;
        return element;
    }

    update(lastVNode, nextVNode, fromPending) {
        const update = () => {
            const __isUpdating = this.__isUpdating;
            this.__isUpdating = true;
            // do not change getChildContext when update parent component
            // in sub-component on init
            const shouldPushAndPop = !__isUpdating && !this.__getChildContext;
            if (shouldPushAndPop) {
                this.__pushGetChildContext(nextVNode || this.vNode);
            }
            const element = super.update(lastVNode, nextVNode, fromPending);
            if (shouldPushAndPop) {
                this.__popGetChildContext();
            }
            this.__isUpdating = __isUpdating;
            return element;
        }

        if (!this._isReact) return update();

        this.__initMountedQueue();

        const element = update();

        this.__triggerMountedQueue();

        return element;
    }

    __pushGetChildContext(nextVNode) {
        const parentRef = nextVNode && nextVNode.props._parentRef;
        const parentInstance = parentRef && parentRef.instance;
        if (parentInstance)  {
            const self = this;
            this.__getChildContext = parentInstance.getChildContext;
            parentInstance.getChildContext = function() {
                const context = self.__getChildContext.call(this);
                return {...context, __parent: self};
            };
        }

        this.__parentInstance = parentInstance;
    }

    __popGetChildContext() {
        if (this.__parentInstance) {
            this.__parentInstance.getChildContext = this.__getChildContext;
            this.__getChildContext = null;
        }
    }

    componentDidMount() {
        this.__initMountedQueue();

        // disable intact async component
        this.inited = true;

        // add parentVNode
        this.parentVNode = this.vNode.parentVNode = this.context.__parent && this.context.__parent.vNode;

        const dom = this.init(null, this.vNode);
        const placeholder = this._placeholder;
        const parentElement = placeholder.parentElement;
        this.parentDom = parentElement;

        // for unmountComponentAtNode
        dom[internalInstanceKey] = placeholder[internalInstanceKey];
        dom[internalEventHandlersKey] = placeholder[internalEventHandlersKey];
        Object.defineProperty(placeholder, 'parentNode', {
            value: parentElement,
        });

        parentElement.replaceChild(dom, placeholder);
        // persist the placeholder to let parentNode to remove the real dom
        placeholder._realElement = dom;
        rewriteParentElementApi(parentElement);

        // add mount lifecycle method to queue
        this.mountedQueue.push(() => {
            this.mount();
        });

        this.__triggerMountedQueue();
    }

    componentWillUnmount() {
        this.destroy();
    }

    componentDidUpdate() {
        this.__initMountedQueue();

        const vNode = h(
            this.constructor,
            normalizeProps(
                this.props,
                this.context,
                {instance: this}
            )
        );
        const lastVNode = this.vNode;
        vNode.children = this;
        this.vNode = vNode;
        this.parentVNode = vNode.parentVNode = this.context.__parent && this.context.__parent.vNode;

        this.update(lastVNode, vNode);

        this.__triggerMountedQueue();
    }

    __ref(element) {
        this._placeholder = element;
        if (!internalInstanceKey) {
            const keys = Object.keys(element);
            internalInstanceKey = keys[0];
            internalEventHandlersKey = keys[1];
        }
    }

    render() {
        // save all context.Provider
        this.__providers = new Map();
        let returnFiber = this._reactInternalFiber;
        while (returnFiber = returnFiber.return) {
            const tag = returnFiber.tag;
            if (tag === 10) { // is ContextProvider
                const type = returnFiber.type;
                this.__providers.set(type, type._context._currentValue);
            } else if (tag === 3) { // HostRoot
                // React will update from root and if root has pendingContext, it will compare
                // the last value and the current value to change `didPerformWorkStatckCursor`,
                // if the cursor is true, all children will be updated
                //
                // always let hasContextChanged return true to make React update the component,
                // even if it props has not changed
                // see unit test: `shuold update children when provider's children...`
                // issue: https://github.com/ksc-fe/kpc/issues/533
                const stateNode = returnFiber.stateNode;
                if (!stateNode.__intactReactDefinedProperty) {
                    let context;
                    Object.defineProperty(stateNode, 'pendingContext', {
                        get() {
                            return context || (returnFiber.context ? {...returnFiber.context} : Object.create(null));
                        },
                        set(v) {
                            context = v;
                        }
                    });
                    stateNode.__intactReactDefinedProperty = true;
                }
                break;
            }
        }
        return React.createElement('i', {
            ref: this.__ref
        });
    }

    get isMounted() {
        return this.mounted;
    }

    // we should promise that all intact components have been mounted
    __initMountedQueue() {
        this._triggerFlagStack.push(this._shouldTrigger);
        this._shouldTrigger = false;
        if (!this.mountedQueue || this.mountedQueue.done) {
            // get from parent
            let tmp;
            if ((tmp = this.context) && (tmp = tmp.__parent) && (tmp = tmp.mountedQueue)) {
                if (!tmp.done) {
                    this.mountedQueue = tmp;
                    return;
                }
            }
            this._shouldTrigger = true;
            this._initMountedQueue();
        }
    }

    __triggerMountedQueue() {
        if (this._shouldTrigger) {
            FakePromise.all(this.__promises).then(() => {
                promises = [];
                this._triggerMountedQueue();
            });
        }
        this._shouldTrigger = this._triggerFlagStack.pop();
    }
}

// for workInProgress.tag detection
IntactReact.prototype.isReactComponent = {};
// for getting _context in Intact
IntactReact.contextTypes = {
    _context: noop,
    __parent: noop,
    __promises: noop,
    router: noop,
};
IntactReact.childContextTypes = {
    __parent: noop,
    __promises: noop,
};

// for compatibility of IE <= 10
if (!Object.setPrototypeOf) {
    extend(IntactReact, Intact);
    // for Intact <= 2.4.4
    if (!IntactReact.template) {
        IntactReact.template = Intact.template;
    }
}

export default IntactReact

