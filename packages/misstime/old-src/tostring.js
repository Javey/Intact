import {Types, EMPTY_OBJ} from './vnode';
import {isNullOrUndefined, isArray, selfClosingTags,
    isStringOrNumber
} from './utils';
import {kebabCase} from './vpatch';

export function toString(vNode, parent, disableSplitText, firstChild) {
    const type = vNode.type;
    const tag = vNode.tag;
    const props = vNode.props;
    const children = vNode.children;
    vNode.parentVNode = parent;

    let html;
    if (type & Types.ComponentClass) {
        const instance = new tag(props); 
        instance.parentVNode = parent;
        instance.vNode = vNode;
        vNode.children = instance;
        html = instance.toString();
    } else if (type & Types.ComponentInstance) {
        children.parentVNode = parent;
        children.vNode = vNode;
        html = children.toString();
    } else if (type & Types.Element) {
        let innerHTML;
        html = `<${tag}`;

        if (!isNullOrUndefined(vNode.className)) {
            html += ` class="${escapeText(vNode.className)}"`;
        }

        if (props !== EMPTY_OBJ) {
            for (let prop in props) {
                const value = props[prop];
                
                if (prop === 'innerHTML') {
                    innerHTML = value;
                } else if (prop === 'style') {
                    html += ` style="${renderStylesToString(value)}"`;
                } else if (
                    prop === 'children' || prop === 'className' || 
                    prop === 'key' || prop === 'ref'
                ) {
                    // ignore
                } else if (prop === 'defaultValue') {
                    if (isNullOrUndefined(props.value) && !isNullOrUndefined(value)) {
                        html += ` value="${isString(value) ? escapeText(value) : value}"`;
                    }
                } else if (prop === 'defaultChecked') {
                    if (isNullOrUndefined(props.checked) && value === true) {
                        html += ' checked';
                    }
                } else if (prop === 'attributes') {
                    html += renderAttributesToString(value);
                } else if (prop === 'dataset') {
                    html += renderDatasetToString(value);
                } else if (tag === 'option' && prop === 'value') {
                    html += renderAttributeToString(prop, value);
                    if (parent && value === parent.props.value) {
                        html += ` selected`;
                    }
                } else {
                    html += renderAttributeToString(prop, value);
                }
            }
        }

        if (selfClosingTags[tag]) {
            html += ` />`;
        } else {
            html += '>';
            if (innerHTML) {
                html += innerHTML;
            } else if (!isNullOrUndefined(children)) {
                if (isString(children)) {
                    html += children === '' ? ' ' : escapeText(children);
                } else if (isNumber(children)) {
                    html += children;
                } else if (isArray(children)) {
                    let index = -1;
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        if (isString(child)) {
                            html += child === '' ? ' ' : escapeText(child);
                        } else if (isNumber(child)) {
                            html += child;
                        } else if (!isNullOrUndefined(child)) {
                            if (!(child.type & Types.Text)) {
                                index = -1;
                            } else {
                                index++;
                            }
                            html += toString(child, vNode, disableSplitText, index === 0);
                        }
                    }
                } else {
                    html += toString(children, vNode, disableSplitText, true);
                }
            }

            html += `</${tag}>`;
        }
    } else if (type & Types.Text) {
        html = (firstChild || disableSplitText ? '' : '<!---->') + 
            (children === '' ? ' ' : escapeText(children));
    } else if (type & Types.HtmlComment) {
        html = `<!--${children}-->`;
    } else if (type & Types.UnescapeText) {
        html = isNullOrUndefined(children) ? '' : children;
    } else {
        throw new Error(`Unknown vNode: ${vNode}`);
    }

    return html;
}

export function escapeText(text) {
    let result = text;
    let escapeString = "";
    let start = 0;
    let i;
    for (i = 0; i < text.length; i++) {
        switch (text.charCodeAt(i)) {
            case 34: // "
                escapeString = "&quot;";
                break;
            case 39: // \
                escapeString = "&#039;";
                break;
            case 38: // &
                escapeString = "&amp;";
                break;
            case 60: // <
                escapeString = "&lt;";
                break;
            case 62: // >
                escapeString = "&gt;";
                break;
            default:
                continue;
        }
        if (start) {
            result += text.slice(start, i);
        } else {
            result = text.slice(start, i);
        }
        result += escapeString;
        start = i + 1;
    }
    if (start && i !== start) {
        return result + text.slice(start, i);
    }
    return result;
}

export function isString(o) {
    return typeof o === 'string';
}

export function isNumber(o) {
    return typeof o === 'number';
}

export function renderStylesToString(styles) {
    if (isStringOrNumber(styles)) {
        return styles;
    } else {
        let renderedString = "";
        for (let styleName in styles) {
            const value = styles[styleName];

            if (isStringOrNumber(value)) {
                renderedString += `${kebabCase(styleName)}:${value};`;
            } 
        }
        return renderedString;
    }
}

export function renderDatasetToString(dataset) {
    let renderedString = '';
    for (let key in dataset) {
        const dataKey = `data-${kebabCase(key)}`;
        const value = dataset[key];
        if (isString(value)) {
            renderedString += ` ${dataKey}="${escapeText(value)}"`;
        } else if (isNumber(value)) {
            renderedString += ` ${dataKey}="${value}"`;
        } else if (value === true) {
            renderedString += ` ${dataKey}="true"`;
        }
    }
    return renderedString;
}

export function renderAttributesToString(attributes) {
    let renderedString = '';
    for (let key in attributes) {
        renderedString += renderAttributeToString(key, attributes[key]);
    }
    return renderedString;
}

function renderAttributeToString(key, value) {
    if (isString(value)) {
        return ` ${key}="${escapeText(value)}"`;
    } else if (isNumber(value)) {
        return ` ${key}="${value}"`;
    } else if (value === true) {
        return ` ${key}`;
    } else {
        return '';
    }
}
