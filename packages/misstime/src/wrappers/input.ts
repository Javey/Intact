import {isNullOrUndefined} from '../utils/utils';
import {attachEvent} from '../events/attachEvents';

// export function inputEvents(dom: HTMLInputElement, nextProps: Props<any>) {
    // if (isCheckedType(nextProps.type)) {
        // attachEvent(dom, 'change', ) 
    // }
// } 

export function applyValueInput(nextProps: any, dom: HTMLInputElement) {
    const {type, value, checked, multiple, defaultValue} = nextProps;
    const hasValue = !isNullOrUndefined(value);

    // FIXME: it seems like it need not handle because patchProp will handle it
    // if (type && type !== dom.type) {
        // dom.setAttribute('type', type);
    // }
    if (!isNullOrUndefined(multiple) && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    if (!isNullOrUndefined(defaultValue) && !hasValue) {
        dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
        if (hasValue) {
            dom.value = value;
        }
        if (!isNullOrUndefined(checked)) {
            dom.checked = checked;
        }
    } else {
        if (hasValue && dom.value !== value) {
            dom.defaultValue = value;
            dom.value = value;
        } else if (!isNullOrUndefined(checked)) {
            dom.checked = checked;
        }
    }
}

export function isCheckedType(type: string) {
    return type === 'checkbox' || type === 'radio';
}
