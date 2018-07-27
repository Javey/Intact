import {
    getAnimateType, addClass, 
    removeClass, TransitionEvents
} from './utils';

export function initMove(o, isUnmount) {
    const {element, position: oldPosition, newPosition} = o;

    o.position = newPosition;

    // 对于新mount的元素，不进行move判断
    if (!oldPosition) return;

    const dx = oldPosition.left - newPosition.left;
    const dy = oldPosition.top - newPosition.top;
    const oDx = o.dx;
    const oDy = o.dy;

    o.dx = dx;
    o.dy = dy;

    if (dx || dy || oDx || oDy) {
        // 对于move中的元素，需要将它重新回到0
        const s = element.style;
        if (isUnmount) {
            s.left = `${oldPosition.left}px`;
            s.top = `${oldPosition.top}px`;
            o._needMove = false;
        } else {
            // 如果当前元素正在enter，而且是animation动画，则要enterEnd
            // 否则无法move
            if (o._entering && getAnimateType(element) !== 'transition') {
                o._enterEnd();
            }
            o._needMove = true;
            s.position = 'relative';
            s.left = `${dx}px`;
            s.top = `${dy}px`;
        }
    } else {
        o._needMove = false;
    }
}

export function move(o) {
    if (o.get('a:disabled')) return;

    o._moving = true;

    const element = o.element;
    const s = element.style;

    addClass(element, o.moveClass);

    o._moveEnd = (e) => {
        e && e.stopPropagation();
        if (!e || /transform$/.test(e.propertyName)) {
            TransitionEvents.off(element, o._moveEnd);
            removeClass(element, o.moveClass);
            s.position = s.left = s.top = s.transform = s.WebkitTransform = '';
            o.dx = o.dy = 0;
            o._moving = false;
        }
    };
    TransitionEvents.on(element, o._moveEnd);

    triggerMove(o);
    // nextFrame(() => o._triggerMove());
}

export function triggerMove(o) {
    const s = o.element.style;
    s.transform = s.WebkitTransform = `translate(${0 - o.dx}px, ${0 - o.dy}px)`;
}
