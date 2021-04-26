import {isNullOrUndefined} from 'intact-shared';
import {attachModelEvent} from '../events/attachEvents';

// export function textareaEvents(dom: HTMLTextAreaElement, event?: EventListener) {
    // attachModelEvent(dom, 'input', event);
// }

export function applyValueTextArea(nextProps: any, dom: HTMLTextAreaElement, mounting: boolean) {
    const value = nextProps.value;
    const domValue = dom.value;

    if (isNullOrUndefined(value)) {
        if (mounting) {
            const defaultValue = nextProps.defaultValue;

            if (!isNullOrUndefined(defaultValue) && defaultValue !== domValue) {
                dom.value = defaultValue;
                dom.defaultValue = defaultValue;
            }
        }
    } else if (domValue !== value) {
        dom.defaultValue = value;
        dom.value = value;
    }
}
