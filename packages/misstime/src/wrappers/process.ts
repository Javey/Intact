import {VNode, Types} from '../utils/types';
import {applyValueInput} from './input';
import {applyValueSelect} from './select';
import {applyValueTextArea} from './textarea';

export function processElement(
    type: Types,
    vNode: VNode,
    dom: Element,
    nextProps: any,
    mounting: boolean,
    isControlled: boolean,
) {
    if (type & Types.InputElement) {
        applyValueInput(nextProps, dom as HTMLInputElement, isControlled);
    } else if (type & Types.SelectElement) {
        applyValueSelect(nextProps, dom as HTMLSelectElement, mounting, vNode, isControlled);
    } else if (type & Types.TextareaElement) {
        applyValueTextArea(nextProps, dom as HTMLTextAreaElement, mounting, isControlled);
    }
}
