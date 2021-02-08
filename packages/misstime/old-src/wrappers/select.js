import {isNullOrUndefined, isArray, indexOf} from '../utils';
import {Types} from '../vnode';

export function processSelect(vNode, dom, nextProps, isRender) {
    const multiple = nextProps.multiple;
    if (multiple !== dom.multiple) {
        dom.multiple = multiple;
    }
    const children = vNode.children;

    if (!isNullOrUndefined(children)) {
        let value = nextProps.value;
        if (isRender && isNullOrUndefined(value)) {
            value = nextProps.defaultValue;
        }
        
        var flag = {hasSelected: false};
        if (isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                updateChildOptionGroup(children[i], value, flag);
            }
        } else {
            updateChildOptionGroup(children, value, flag);
        }
        if (!flag.hasSelected) {
            dom.value = '';
        }
    }
}

function updateChildOptionGroup(vNode, value, flag) {
    const tag = vNode.tag;

    if (tag === 'optgroup') {
        const children = vNode.children;

        if (isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                updateChildOption(children[i], value, flag);
            }
        } else {
            updateChildOption(children, value, flag);
        }
    } else {
        updateChildOption(vNode, value, flag);
    }
}

function updateChildOption(vNode, value, flag) {
    // skip text and comment node
    if (vNode.type & Types.HtmlElement) {
        const props = vNode.props;
        const dom = vNode.dom;

        if (isArray(value) && indexOf(value, props.value) !== -1 || props.value === value) {
            dom.selected = true;
            if (!flag.hasSelected) flag.hasSelected = true;
        } else if (!isNullOrUndefined(value) || !isNullOrUndefined(props.selected)) {
            let selected = !!props.selected;
            if (!flag.hasSelected && selected) flag.hasSelected = true;
            dom.selected = selected;
        }
    }
}
