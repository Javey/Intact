import {addClass, TransitionEvents, nextFrame} from './utils';

export default function leave(o) {
    const element = o.element;

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
