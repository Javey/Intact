import {VNode, ChildrenTypes, Types} from '../types';
import {isNullOrUndefined, isNumber, isArray, isUndefined} from '../utils';
import {EMPTY_OBJ} from '../common';

export function applyValueSelect(nextProps: any, dom: HTMLSelectElement, mounting: boolean, vNode: VNode) {
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
        if (!isNullOrUndefined(value)) {
            const flag = {hasSelected: false};
            updateChildOptions(vNode, value, flag);
            if (!flag.hasSelected) {
                dom.selectedIndex = -1;
            }
        }
    }
}

function updateChildOptions(vNode: VNode, value: string, flag: {hasSelected: boolean}) {
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

function updateChildOption(vNode: VNode, value: string, flag: {hasSelected: boolean}) {
    const props = vNode.props || EMPTY_OBJ;
    const dom = vNode.dom as HTMLOptionElement;

    // dom.value = props.value;
    if (props.value === value || isArray(value) && value.indexOf(props.value) !== -1) {
        flag.hasSelected = true;
        dom.selected = true;
    } 
    // else if (!isNullOrUndefined(value) || !isNullOrUndefined(props.selected)) {
        // const selected = props.selected || false;
        // if (selected) flag.hasSelected = true;
        // // dom.selected = selected;
    // }
}
