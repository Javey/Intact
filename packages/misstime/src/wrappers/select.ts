import {VNode, ChildrenTypes, Types, Reference} from '../utils/types';
import {isNullOrUndefined, isNumber, isArray, isUndefined} from '../utils/utils';
import {EMPTY_OBJ, REFERENCE} from '../utils/common';

export function applyValueSelect(
    nextProps: any,
    dom: HTMLSelectElement,
    mounting: boolean,
    vNode: VNode,
    isControlled: boolean,
) {
    const multiple = nextProps.multiple;
    if (!isNullOrUndefined(multiple) && multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    const index = nextProps.selectedIndex;
    if (index === -1) {
        dom.selectedIndex = -1;
    }

    const childrenType = vNode.childrenType;
    if (childrenType !== ChildrenTypes.HasInvalidChildren) {
        let value = nextProps.value;
        if (isNumber(index) && index > -1 && dom.options[index]) {
            value = dom.options[index].value;
        }
        if (mounting && isNullOrUndefined(value)) {
            value = nextProps.defaultValue;
        }
        if (!isNullOrUndefined(value) || isControlled || multiple) {
            REFERENCE.value = false;
            updateChildOptions(vNode, value, REFERENCE);
            if (!REFERENCE.value) {
                dom.selectedIndex = -1;
            }
        }
    }
}

function updateChildOptions(vNode: VNode, value: string, flag: Reference) {
    if (vNode.tag === 'option') {
        updateChildOption(vNode, value, flag);
    } else {
        const children = vNode.children;
        const type = vNode.type;

        if (type & Types.ComponentClass) {
            // TODO
        } else if (type & Types.ComponentFunction) {
            // TODO
        } else if (vNode.childrenType === ChildrenTypes.HasVNodeChildren) {
            updateChildOptions(children as VNode, value, flag);
        } else if (vNode.childrenType & ChildrenTypes.MultipleChildren) {
            for (let i = 0, len = (children as VNode[]).length; i < len; ++i) {
                updateChildOptions((children as VNode[])[i], value, flag);
            }
        }
    }
}

function updateChildOption(vNode: VNode, value: string, flag: Reference) {
    const props = vNode.props || EMPTY_OBJ;
    const dom = vNode.dom as HTMLOptionElement;

    // dom.value = props.value;
    if (props.value === value || isArray(value) && value.indexOf(props.value) !== -1) {
        flag.value = true;
        dom.selected = true;
    } else if (!isNullOrUndefined(value)) {
        // if exist value ignore the selected prop of option
        dom.selected = false;
    } else if (!isNullOrUndefined(props.selected)) {
        const selected = props.selected || false;
        if (selected) flag.value = true;
        dom.selected = selected;
    }
}
