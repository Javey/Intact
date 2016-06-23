import {each, isArray, bind} from './utils';
import Intact from './intact';
import Vdt from 'vdt';

// Animate Widget for animation
export default Intact.extend({
    displayName: 'Animate',

    defaults: {
        tagName: 'div',
        transition: 'animate'
    },

    template: Vdt.compile('return h(this.get("tagName"), _.extend({}, this.get()), _.values(this.childrenMap))', {autoReturn: false}),

    _init() {
        this._ = _;
        this.key = this.get('key');
        this.childrenMap = getChildMap(this.children);
        this.currentKeys = {};
        this.keysToEnter = [];
        this.keysToLeave = [];
    },

    _beforeUpdate(prevWidget) {
        if (!prevWidget) return;

        let nextMap = getChildMap(this.children);
            prevMap = prevWidget.childrenMap;
        this.childrenMap = mergeChildren(prevMap, nextMap);

        each(nextMap, function(value, key) {
            if (nextMap[key] && !prevMap.hasOwnProperty(key) && !this.currentKeys[key]) {
                this.keysToEnter.push(key);
            }
        }, this);

        each(prevMap, function(value, key) {
            if (prevMap[key] && !nextMap.hasOwnProperty(key) && !this.currentKeys[key]) {
                this.keysToLeave.push(key);
            }
        }, this);
    },

    _update(prevWidget) {
        if (!prevWidget) return;

        let keysToEnter = this.keysToEnter;
        this.keysToEnter = [];
        each(keysToEnter, this.performEnter, this);

        let keysToLeave = this.keysToLeave;
        this.keysToLeave = [];
        each(keysToLeave, this.performLeave, this);
    },

    performEnter(key) {
        let widget = this.childrenMap[key].widget;
        this.currentKeys[key] = true;
        if (widget && widget.enter) {
            widget.enter(bind(this._doneEntering, this, key));
        } else {
            this._doneEntering(key);
        }
    },

    performLeave(key) {
        let widget = this.childrenMap[key].widget;
        this.currentKeys[key] = true;
        if (widget && widget.leave) {
            widget.leave(bind(this._doneLeaving, this, key));
        } else {
            this._doneLeaving(key);
        }
    },

    _doneEntering(key) {
        delete this.currentKeys[key];
        let map = getChildMap(this.children);
        if (!map[key]) {
            this.performLeave(key);
        }
    },

    _doneLeaving(key) {
        delete this.currentKeys[key];
        let map = getChildMap(this.children);
        if (map && map[key]) {
            this.performEnter(key);
        } else {
            delete this.childrenMap[key];
            this.vdt.update();
        }
    },

    enter(done) {
        let transition = this.get('transition'),
            element = this.element;

        addClass(element, `${transition}-enter`);
        TransitionEvents.one(element, (e) => {
            e && e.stopPropagation();
            removeClass(element, `${transition}-enter`);
            removeClass(element, `${transition}-enter-active`);
            done();
        });
        element.offsetWidth = element.offsetWidth;
        addClass(element, `${transition}-enter-active`);
    },

    leave(done) {
        let transition = this.get('transition'),
            element = this.element;

        addClass(element, `${transition}-leave`);
        TransitionEvents.one(element, (e) => {
            e && e.stopPropagation();
            removeClass(element, `${transition}-leave`);
            removeClass(element, `${transition}-leave-active`);
            done();
        });
        element.offsetWidth = element.offsetWidth;
        addClass(element, `${transition}-leave-active`);
    }
});

/**
 * 将子元素数组转为map
 * @param children
 * @param ret
 * @param index
 * @returns {*}
 */
function getChildMap(children, ret, index) {
    if (!children) {
        return children;
    }
    ret = ret || {};
    index = index || '$0';
    each(children, function(child, _index) {
        _index = `$${_index}`;
        if (child && (child.type === 'Widget' || child.type === 'Thunk')) {
            ret[child.key || _index] = child;
        } else if (isArray(child)) {
            getChildMap(child, ret, `${index}${_index}`);
        } else {
            ret[`${index}${_index}`] = child;
        }
    });
    return ret;
}

/**
 * 合并两个子元素map
 * @param prev
 * @param next
 * @returns {*|{}}
 */
function mergeChildren(prev, next) {
    prev = prev || {};
    next = next || {};

    function getValueForKey(key) {
        if (next.hasOwnProperty(key)) {
            return next[key];
        } else {
            return prev[key];
        }
    }

    // For each key of `next`, the list of keys to insert before that key in
    // the combined list
    let nextKeysPending = {};

    let pendingKeys = [];
    for (let prevKey in prev) {
        if (next.hasOwnProperty(prevKey)) {
            if (pendingKeys.length) {
                nextKeysPending[prevKey] = pendingKeys;
                pendingKeys = [];
            }
        } else {
            pendingKeys.push(prevKey);
        }
    }

    let childMapping = {};
    for (let nextKey in next) {
        if (nextKeysPending.hasOwnProperty(nextKey)) {
            for (let i = 0; i < nextKeysPending[nextKey].length; i++) {
                let pendingNextKey = nextKeysPending[nextKey][i];
                let value = getValueForKey(pendingNextKey);
                childMapping[nextKeysPending[nextKey][i]] = getValueForKey(
                    pendingNextKey
                );
            }
        }
        childMapping[nextKey] = getValueForKey(nextKey);
    }

    // Finally, add the keys which didn't appear before any key in `next`
    for (let i = 0; i < pendingKeys.length; i++) {
        childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
    }

    return childMapping;
}

function addClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.add(className);
        } else if (!hasClass(element, className)) {
            element.className += ` ${className}`;
        }
    }
    return element;
}

function hasClass(element, className) {
    if (element.classList) {
        return !!className && element.className.contains(className);
    }
    return (` ${element.className} `).indexOf(` ${className} `) > -1;
}

function removeClass(element, className) {
    if (className) {
        if (element.classList) {
            element.classList.remove(className);
        } else if (hasClass(element, className)) {
            element.className = element.className
                .replace(new RegExp(`(^|\\s)${className}(?:\\s|$)`, 'g'), '$1')
                .replace(/\s+/g, ' ') // multiple spaces to one
                .replace(/^\s*|\s*$/g, ''); // trim the ends
        }
    }
}

let EVENT_NAME_MAP = {
    transitionend: {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'mozTransitionEnd',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd'
    },

    animationend: {
        'animation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd',
        'MozAnimation': 'mozAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd'
    }
};

let endEvents = [];

function detectEvents() {
    let testEl = document.createElement('div');
    let style = testEl.style;

    // On some platforms, in particular some releases of Android 4.x,
    // the un-prefixed "animation" and "transition" properties are defined on the
    // style object but the events that fire will still be prefixed, so we need
    // to check if the un-prefixed events are useable, and if not remove them
    // from the map
    if (!('AnimationEvent' in window)) {
        delete EVENT_NAME_MAP.animationend.animation;
    }

    if (!('TransitionEvent' in window)) {
        delete EVENT_NAME_MAP.transitionend.transition;
    }

    for (let baseEventName in EVENT_NAME_MAP) {
        let baseEvents = EVENT_NAME_MAP[baseEventName];
        for (let styleName in baseEvents) {
            if (styleName in style) {
                endEvents.push(baseEvents[styleName]);
                break;
            }
        }
    }
}

detectEvents();

function addEventListener(node, eventName, eventListener) {
    node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
    node.removeEventListener(eventName, eventListener, false);
}

let TransitionEvents = {
    on: function(node, eventListener) {
        if (endEvents.length === 0) {
            // If CSS transitions are not supported, trigger an "end animation"
            // event immediately.
            window.setTimeout(eventListener, 0);
            return;
        }
        endEvents.forEach(function(endEvent) {
            addEventListener(node, endEvent, eventListener);
        });
    },

    off: function(node, eventListener) {
        if (endEvents.length === 0) {
            return;
        }
        endEvents.forEach(function(endEvent) {
            removeEventListener(node, endEvent, eventListener);
        });
    },

    one: function(node, eventListener) {
        let listener = function() {
            eventListener.apply(this, arguments);
            TransitionEvents.off(node, listener);
        };
        TransitionEvents.on(node, listener);
    }
};
