import {isNullOrUndefined} from '../utils';

export function processTextarea(vNode, dom, nextProps, isRender) {
    const value = nextProps.value;
    const domValue = dom.value;

    if (isNullOrUndefined(value)) {
        if (isRender) {
            const defaultValue = nextProps.defaultValue;
            if (!isNullOrUndefined(defaultValue)) {
                if (defaultValue !== domValue) {
                    dom.value = defaultValue;
                }
            } else if (domValue !== '') {
                dom.value = '';
            }
        }
    } else {
        if (domValue !== value) {
            dom.value = value;
        }
    }
}
