import prototype from './prototype';
import {TransitionEvents, nextFrame} from './utils';
import {inBrowser} from '../utils';
import checkMode from './check-mode';
import {Types} from 'misstime/src/vnode';

prototype.init = inBrowser ? 
    function(lastVNode, nextVNode) {
        const parentDom = this.parentVNode && this.parentVNode.dom || this.parentDom;
        if (parentDom && parentDom._reserve) {
            lastVNode = parentDom._reserve[nextVNode.key];
        }

        return this._super(lastVNode, nextVNode);
    } : 
    function() { 
        return this._superApply(arguments); 
    };

prototype.destroy = function(lastVNode, nextVNode, parentDom, _directly) {
    // 1: 不存在parentDom，有两种情况：
    //      1): 父元素也要被销毁，此时: !parentDom && lastVNode && !nextVNode
    //      2): 该元素将被替换，此时：!parentDom && lastVNode && nextVNode
    //      对于1)，既然父元素要销毁，那本身也要直接销毁
    //      对于2)，本身必须待动画结束方能销毁
    // 2: 如果该元素已经动画完成，直接销毁
    // 3: 如果直接调用destroy方法，则直接销毁，此时：!lastVNode && !nextVNode && !parentDom
    // 4: 如果不是延迟destroy子元素，则立即销毁
    // 5: 如果是禁止动画的元素，且该元素是组件直接返回的动画元素，则直接销毁
    if (!this.get('a:delayDestroy') ||
        !parentDom && !nextVNode && !isRemoveDirectly(this) ||
        this._leaving === false ||
        _directly
    ) {
        this._super(lastVNode, nextVNode, parentDom);
    }
};

function isRemoveDirectly(instance) {
    let parentVNode = instance.parentVNode;
    while (parentVNode && (parentVNode.type & Types.ComponentClassOrInstance)) {
        const i = parentVNode.children;
        if (i._isRemoveDirectly) {
            return instance.element === i.element;
        }
        parentVNode = parentVNode.parentVNode;
    }
    return false;
}

export default function leave(o) {
    if (o.get('a:disabled')) return;
    // maybe a a:show animation is leaving
    if (o._leaving) return;

    const element = o.element;

    if (element.style.display === 'none') return o.leaveEndCallback(true);

    const vNode = o.vNode;
    const parentDom = o._parentDom;
    // vNode都会被添加key，当只有一个子元素时，vNode.key === undefined
    // 这种情况，我们也当成有key处理，此时key为undefined
    if (!parentDom._reserve) {
        parentDom._reserve = {};
    }
    parentDom._reserve[vNode.key] = vNode;

    o._leaving = true;

    let endDirectly;
    if (o._entering) {
        if (!o._triggeredEnter) {
            endDirectly = true;
        }
        o._enterEnd();
    }

    initLeaveEndCallback(o);

    o.trigger('a:leaveStart', element);

    if (!endDirectly) {
        // 为了保持动画连贯，我们立即添加leaveActiveClass
        // 但如果当前元素还没有来得及做enter动画，就被删除
        // 则leaveActiveClass和leaveClass都放到下一帧添加
        // 否则leaveClass和enterClass一样就不会有动画效果
        if (o.get('a:css')) {
            o._addClass(o.leaveActiveClass);
        }

        // TransitionEvents.on(element, o._leaveEnd);
        // triggerLeave(o);
        nextFrame(() => {
            // 1. 如果leave动画还没得及执行，就enter了，此时啥也不做
            if (o._unmountCancelled) return;
            // 存在一种情况，当一个enter动画在完成的瞬间，
            // 这个元素被删除了，由于前面保持动画的连贯性
            // 添加了leaveActiveClass，则会导致绑定的leaveEnd
            // 立即执行，所以这里放到下一帧来绑定
            TransitionEvents.on(element, o._leaveEnd);
            triggerLeave(o);
        });
    } else {
        o._leaveEnd();
    }
}

function triggerLeave(o) {
    if (o._leaving === false) return;

    o._triggeredLeave = true;

    const element = o.element;
    if (o.get('a:css')) {
        o._addClass(o.leaveActiveClass);
        o._addClass(o.leaveClass);
    }

    o.trigger('a:leave', element, o._leaveEnd);
}

function initLeaveEndCallback(o) {
    const {element, _parentDom, vNode} = o;

    o._leaveEnd = (e) => {
        if (e && e.target !== element) return;

        TransitionEvents.off(element, o._leaveEnd);

        if (o.get('a:css') && !o.get('a:disabled')) {
            e && e.stopPropagation && e.stopPropagation();
            o._removeClass(o.leaveClass);
            o._removeClass(o.leaveActiveClass);
        }
        if (o._triggeredLeave) {
            const s = element.style;
            s.position = s.top = s.left = s.transform = s.WebkitTransform = '';
        }

        o._leaving = false;
        o._triggeredLeave = false;
        delete _parentDom._reserve[vNode.key];

        const parentInstance = o.parentInstance;
        if (parentInstance) {
            if (--parentInstance._leavingAmount === 0 &&
                parentInstance.get('a:mode') === 'out-in'
            ) {
                checkMode(parentInstance);
            }
        }

        o.trigger('a:leaveEnd', element);
        if (!o._unmountCancelled) {
            o.leaveEndCallback(true);
        }
    };
}
