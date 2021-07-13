import {isNullOrUndefined} from 'intact-shared';

export function applyValueInput(nextProps: any, dom: HTMLInputElement, isControlled: boolean) {
    let {type, value, checked, multiple, defaultValue} = nextProps;

    let hasValue = true;
    if (isNullOrUndefined(value)) {
        value = '';
        hasValue = false;
    }

    // FIXME: it seems like it need not handle because patchProp will handle it
    // if (type && type !== dom.type) {
        // dom.setAttribute('type', type);
    // }
    if (!isNullOrUndefined(multiple) && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    if (!isNullOrUndefined(defaultValue) && !isControlled) {
        dom.defaultValue = defaultValue + '';
    }
    if (isCheckedType(type)) {
        if (isControlled || hasValue) {
            dom.value = value;
        }
        if (!isNullOrUndefined(checked)) {
            dom.checked = checked;
        }
    } else {
        if ((isControlled || hasValue) && dom.value !== value) {
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
