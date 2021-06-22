import {isNullOrUndefined} from 'intact-shared';

// export function textareaEvents(dom: HTMLTextAreaElement, event?: EventListener) {
    // attachModelEvent(dom, 'input', event);
// }

export function applyValueTextArea(nextProps: any, dom: HTMLTextAreaElement, mounting: boolean, isControlled: boolean) {
    const value = nextProps.value;
    const domValue = dom.value;

    if (!isControlled) {
        if (mounting) {
            const defaultValue = nextProps.defaultValue;

            if (!isNullOrUndefined(defaultValue) && defaultValue !== domValue) {
                dom.value = dom.defaultValue = defaultValue;
            }
        }
    } else if (domValue !== value) {
        dom.value = dom.defaultValue = isNullOrUndefined(value) ? '' : value;
    }
}
