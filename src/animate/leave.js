import prototype from './prototype';
import {addClass, removeClass, TransitionEvents, nextFrame} from './utils';
import {noop, inBrowser} from '../utils';
import checkMode from './check-mode';

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

prototype.destroy = function(lastVNode, nextVNode, parentDom) {
    // 1: 不存在parentDom，有两种情况：
    //      1): 父元素也要被销毁，此时: !parentDom && lastVNode && !nextVNode
    //      2): 该元素将被替换，此时：!parentDom && lastVNode && nextVNode
    //      对于1)，既然父元素要销毁，那本身也要直接销毁
    //      对于2)，本身必须待动画结束方能销毁
    // 2: 如果该元素已经动画完成，直接销毁
    // 3: 如果直接调用destroy方法，则直接销毁，此时：!lastVNode && !nextVNode && !parentDom
    // 4: 如果不是延迟destroy子元素，则立即销毁
    if (!this.get('a:delayDestroy') ||
        !parentDom && !nextVNode && this.parentVNode.dom !== this.element ||
        // this.get('a:disabled') || 
        this._leaving === false
    ) {
        this._super(lastVNode, nextVNode, parentDom);
    }
};

export default function leave(o) {
    if (o.get('a:disabled')) return;

    const element = o.element;
    const vNode = o.vNode;
    const parentDom = o.parentDom;
    // vNode都会被添加key，当只有一个子元素时，vNode.key === undefined
    // 这种情况，我们也当成有key处理，此时key为undefined
    if (!parentDom._reserve) {
        parentDom._reserve = {};
    }
    parentDom._reserve[vNode.key] = vNode;

    o._leaving = true;

    if (o._entering) {
        TransitionEvents.off(element, o._enterEnd);
        o._enterEnd();
    }

    addLeaveEndCallback(o);

    // 为了保持动画连贯，我们立即添加leaveActiveClass
    // 但如果当前元素还没有来得及做enter动画，就被删除
    // 则leaveActiveClass和leaveClass都放到下一帧添加
    // 否则leaveClass和enterClass一样就不会有动画效果
    if (o._triggeredEnter && o.get('a:css')) {
        addClass(element, o.leaveActiveClass);
    }

    // TransitionEvents.on(element, o._leaveEnd);
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

    // 存在一种情况，相同的dom，同时被子组件和父组件管理的情况
    // 所以unmount后，将其置为空函数，以免再次unmount
    element._unmount = noop;

    o.trigger('a:leaveStart', element);
}

function triggerLeave(o) {
    o._triggeredLeave = true;
    if (o._leaving === false) {
        return;
    }

    const element = o.element;
    if (o.get('a:css')) {
        addClass(element, o.leaveActiveClass);
        addClass(element, o.leaveClass);
    }

    o.trigger('a:leave', element, o._leaveEnd);
}

function addLeaveEndCallback(o) {
    const {element, parentDom, vNode} = o;

    o._leaveEnd = (e) => {
        if (e && e.target !== element) return;

        if (o.get('a:css') && !o.get('a:disabled')) {
            e && e.stopPropagation && e.stopPropagation();
            removeClass(element, o.leaveClass);
            removeClass(element, o.leaveActiveClass);
        }
        if (o._triggeredLeave) {
            const s = element.style;
            s.position = s.top = s.left = s.transform = s.WebkitTransform = '';
        }

        o._leaving = false;
        delete parentDom._reserve[vNode.key];
        TransitionEvents.off(element, o._leaveEnd);

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
            parentDom.removeChild(element);
            if (o.get('a:delayDestroy')) {
                o.destroy(vNode, null, parentDom);
            }
        }
    };
}
