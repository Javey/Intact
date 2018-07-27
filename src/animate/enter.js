import {
    addClass, removeClass, getAnimateType,
    nextFrame, TransitionEvents
} from './utils';

export default function enter(o) {
    if (o.get('a:disabled')) return;

    o._entering = true;

    const element = o.element;
    const enterClass = o.enterClass;
    const enterActiveClass = o.enterActiveClass;
    const isCss = o.get('a:css');

    // getAnimateType将添加enter-active className，在firefox下将导致动画提前执行
    // 我们应该先于添加`enter` className去调用该函数
    let isTransition = false;
    if (isCss && getAnimateType(element, enterActiveClass) !== 'animation') {
        isTransition = true;
    }

    // 如果这个元素是上一个删除的元素，则从当前状态回到原始状态
    if (o.lastInstance) {
        o.lastInstance._unmountCancelled = true;
        o.lastInstance._leaveEnd();

        if (isCss) {
            if (o.lastInstance._triggeredLeave) {
                // addClass(element, enterActiveClass);
                // 保持连贯，添加leaveActiveClass
                addClass(element, o.leaveActiveClass);
            } else {
                // 如果上一个元素还没来得及做动画，则当做新元素处理
                addClass(element, enterClass);
            }
        }
    } else if (isCss) {
        addClass(element, enterClass);
    }
    TransitionEvents.on(element, o._enterEnd);

    o.trigger(`${o.enterEventName}Start`, element);

    if (isTransition) {
        nextFrame(() => triggerEnter(o));
    } else {
        // 对于animation动画，同步添加enterActiveClass，避免闪动
        triggerEnter(o);
    }
}

function triggerEnter(o) {
    const element = o.element;

    o._triggeredEnter = true;

    if (o.get('a:css')) {
        if (o._entering === false) {
            return removeClass(element, o.enterActiveClass);
        }
        addClass(element, o.enterActiveClass);
        removeClass(element, o.enterClass);
        removeClass(element, o.leaveActiveClass);
    }

    o.trigger(o.enterEventName, element, o._enterEnd);
}
