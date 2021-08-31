import ReactDOM from 'react-dom';
import FakePromise from './FakePromise';
import {noop} from './functionalWrapper';
import React from 'react';

const ignorePropRegExp = /_ev[A-Z]/;

export const commentNodeValue = ' react-mount-point-unstable ';

// wrap the react element to render it by react self
export default class Wrapper {
    init(lastVNode, nextVNode) {
        // let the component destroy by itself
        this.destroyed = true;
        // react can use comment node as parent so long as its text likes bellow
        const placeholder = this.placeholder = document.createComment(commentNodeValue);

        // we should append the placholder advanced,
        // because when a intact component update itself
        // the _render will update react element sync
        //
        // maybe the parent component return this element directly
        // so we must find parent's parent
        let parentDom = this.parentDom;
        if (!parentDom) {
            let parentVNode = this.parentVNode;
            while (parentVNode) {
                if (parentVNode.dom) {
                    parentDom = parentVNode.dom;
                    break;
                }
                parentVNode = parentVNode.parentVNode;
            }
        }
        if (parentDom) {
            parentDom.appendChild(placeholder);
            rewriteParentElementApi(parentDom);
        }
        this._render(nextVNode);
        return placeholder;
    }

    update(lastVNode, nextVNode) {
        this._render(nextVNode);
        return this.placeholder;
    }

    destroy(lastVNode, nextVNode, parentDom) {
        const placeholder = this.placeholder;
        const _parentDom = placeholder.parentNode;
        // get parentNode even if it has been removed
        // hack for intact replace child
        Object.defineProperty(placeholder, 'parentNode', {
            value: _parentDom
        });

        // let react remove it, intact never remove it
        ReactDOM.render(null, placeholder, () => {
            _parentDom.removeChild(placeholder);
        });

        // set _unmount to let Intact never call replaceChild in replaceElement function
        placeholder._unmount = noop;
        if (placeholder._realElement) {
            placeholder._realElement._unmount = noop;
        }
    }

    _render(nextVNode) {
        let vNode = this._addProps(nextVNode);
        const placeholder = this.placeholder;

        let parentComponent = nextVNode.props._parentRef.instance;
        if (parentComponent) {
            if (!parentComponent._reactInternalFiber) {
                // is a firsthand intact component, get its parent instance
                parentComponent = parentComponent.get('_parentRef').instance;
            }
        } else {
            // maybe the property which value is vNodes
            // find the closest IntactReact instance
            let parentVNode = nextVNode.parentVNode;
            while (parentVNode) {
                const children = parentVNode.children;
                if (children && children._reactInternalFiber !== undefined) {
                    parentComponent = children;
                    break;
                }
                parentVNode = parentVNode.parentVNode;
            }
        }
        // if there are providers, pass it to subtree
        const providers = parentComponent.__providers;
        providers.forEach((value, provider) => {
            vNode = React.createElement(provider, {value}, vNode);
        });
        const promise = new FakePromise(resolve => {
            // the parentComponent should always be valid
            ReactDOM.unstable_renderSubtreeIntoContainer(
                parentComponent,
                vNode,
                placeholder,
                // this.parentDom,
                function() {
                    // if the parentVNode is a Intact component, it indicates that
                    // the Wrapper node is returned by parent component directly
                    // in this case we must fix the element property of parent component.
                    let dom;
                    if (this) {
                        dom = this.nodeType === 3 /* TextNode */ ? this : ReactDOM.findDOMNode(this);
                    } else {
                        // maybe this element is wrapped by Provider
                        // and we can not get the instance
                        // but the real element is inserted before the placeholder by React
                        // dom = placeholder.previousSibling;
                        // @modify: look up child to get dom
                        dom = getDomFromFiber(placeholder._reactRootContainer._internalRoot.current);
                    }
                    if (dom) {
                        // maybe dom is <i></i>, then get its _realElement
                        if (dom._realElement) dom = dom._realElement;
                        placeholder._realElement = dom;
                        dom._placeholder = placeholder;
                    }
                    resolve();
                }
            );
        });
        parentComponent.__promises.push(promise);
    }

    // we can change props in intact, so we should sync the changes
    _addProps(vNode) {
        // for Intact reusing the dom
        this.vdt = {vNode};

        const props = vNode.props;
        // react vNode has been frozen, so we must clone it to change
        let cloneVNode;
        let _props;
        for (let key in props) {
            if (key === 'reactVNode' || key === '_parentRef') continue;
            // ignore _evClick _evMouseEnter property which add in some components temporarily
            if (ignorePropRegExp.test(key)) continue;
            if (!cloneVNode) {
                cloneVNode = {...props.reactVNode};
                _props = cloneVNode.props = {...cloneVNode.props};
            }
            const prop = props[key];
            // is event
            if (key.substr(0, 3) === 'ev-') {
                _props[eventsMap[key]] = prop;
            } else {
                _props[key] = prop;
            }
        }

        return cloneVNode || props.reactVNode;
    }
}

const eventsMap = {
    'ev-click': 'onClick',
    'ev-mouseenter': 'onMouseEnter',
    'ev-mouseleave': 'onMouseLeave',
};

export function rewriteParentElementApi(parentElement) {
    if (!parentElement._hasRewrite) {
        const removeChild = parentElement.removeChild;
        parentElement.removeChild = function(child) {
            child = child._realElement || child;
            if (child.__intactIsRemoved) return;
            removeChild.call(this, child);
            child.__intactIsRemoved = true;
            clearDom(child);
        }

        const insertBefore = parentElement.insertBefore;
        parentElement.insertBefore = function(child, beforeChild) {
            insertBefore.call(this, child, beforeChild && beforeChild._realElement || beforeChild);
        }

        // const replaceChild = parentElement.replaceChild;
        // parentElement.replaceChild = function(newChild, oldChild) {
            // replaceChild.call(this, newChild, oldChild && oldChild._realElement || oldChild);
            // clearDom(oldChild);
        // }

        parentElement._hasRewrite = true;
    }
}

function clearDom(dom) {
    let tmp;
    if (tmp = dom._realElement) {
        delete dom._realElement;
        delete tmp._placeholder;
    } else if (tmp = dom._placeholder) {
        delete dom._placeholder;
        delete tmp._realElement;
    }
}

function getDomFromFiber(fiber) {
    if (!fiber) return null;
    switch (fiber.tag) {
        case 5 /* HostComponent */:
            return fiber.stateNode;
        default:
            return getDomFromFiber(fiber.child);
    }
}
