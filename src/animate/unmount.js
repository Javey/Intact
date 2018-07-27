import prototype from './prototype';
import {removeClass, TransitionEvents} from './utils';
import {noop} from '../utils';
import checkMode from './check-mode';
import leave from './leave';

prototype._unmount = function() {
    if (this.get('a:disabled')) return;

    const element = this.element;
    const vNode = this.vNode;
    const parentDom = this.parentDom;
    // vNode都会被添加key，当只有一个子元素时，vNode.key === undefined
    // 这种情况，我们也当成有key处理，此时key为undefined
    if (!parentDom._reserve) {
        parentDom._reserve = {};
    }
    parentDom._reserve[vNode.key] = vNode;

    this._leaving = true;

    if (this._entering) {
        TransitionEvents.off(element, this._enterEnd);
        this._enterEnd();
    }

    addLeaveEndCallback(this);

    leave(this);

    // 存在一种情况，相同的dom，同时被子组件和父组件管理的情况
    // 所以unmount后，将其置为空函数，以免再次unmount
    element._unmount = noop;

    this.trigger('a:leaveStart', element);
};

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
