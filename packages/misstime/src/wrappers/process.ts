import {VNode, Types, Props} from '../utils/types';
import {applyValueInput, inputEvents} from './input';
import {applyValueSelect, selectEvents} from './select';
import {applyValueTextArea, textareaEvents} from './textarea';
import {isNullOrUndefined} from 'intact-shared';
import {wrapLinkEvent} from '../events/linkEvent';

export function processElement(
    type: Types,
    vNode: VNode,
    dom: Element,
    nextProps: any,
    mounting: boolean,
    isControlled: boolean,
) {
    if (type & Types.InputElement) {
        applyValueInput(nextProps, dom as HTMLInputElement);
    } else if (type & Types.SelectElement) {
        applyValueSelect(nextProps, dom as HTMLSelectElement, mounting, vNode, isControlled);
    } else if (type & Types.TextareaElement) {
        applyValueTextArea(nextProps, dom as HTMLTextAreaElement, mounting);
    }
}

// export function processVModel(
    // type: Types,
    // dom: Element,
    // event: EventListener | undefined, 
    // lastProps: Props<any>,
    // nextProps: Props<any>,
// ) {
    // if (type & Types.InputElement) {
        // inputEvents(dom as HTMLInputElement, lastProps.type, nextProps.type, event);
    // } else if (type & Types.SelectElement) {
        // selectEvents(dom as HTMLSelectElement, event);
    // } else if (type & Types.TextareaElement) {
        // textareaEvents(dom as HTMLTextAreaElement, event);
    // }
// }

// export function isControlledFormElement(nextProps: any) {
    // return nextProps.type && isCheckedType(nextProps.type) ? 
        // !isNullOrUndefined(nextProps.checked) :
        // !isNullOrUndefined(nextProps.value);
// }
