import {isNullOrUndefined} from '../utils/utils';

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
