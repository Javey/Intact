import {processSelect} from './select';
import {processInput} from './input';
import {processTextarea} from './textarea';
import {Types} from '../vnode';

export function processForm(vNode, dom, nextProps, isRender) {
    const type = vNode.type;
    if (type & Types.InputElement) {
        processInput(vNode, dom, nextProps, isRender);
    } else if (type & Types.TextareaElement) {
        processTextarea(vNode, dom, nextProps, isRender);
    } else if (type & Types.SelectElement) {
        processSelect(vNode, dom, nextProps, isRender);
    }
}
