import {
    Directives,
    Types,
    SourceLocation,
    ASTChild,
    ASTNode,
    ASTElement,
    ASTAttribute,
    ASTAttributeTemplateValue,
} from './types';
import {throwError, isElementNode} from './helpers';

export function validateDirectiveValue(name: string, valueType: Types, tag: string, tagType: Types, source: string, loc: SourceLocation) {
    if (name === Directives.Raw) {
        if (tagType !== Types.JSXCommonElement) {
            throwError(`Only html elememt supports v-raw, but got: ${tag}`, loc, source);
        }
    } else if (name === Directives.ForKey || name === Directives.ForValue) {
        if (valueType !== Types.JSXString) {
            throwError(`'${name}' must be a literal string.`, loc, source);
        }
    } else if (name === Directives.For || name === Directives.If || name === Directives.ElseIf) {
        if (valueType !== Types.JSXExpression) {
            throwError(`'${name}' must be a expression.`, loc, source);
        }
    } else if (name === Directives.Else) {
        if (valueType !== Types.JSXNone) {
            throwError(`'${name}' should not have value.`, loc, source);
        }
    }
}

export function validateModel(tag: string, type: Types, attributes: ASTElement['attributes'], source: string) {
    const find = (name: string) => {
        return attributes.find(attr => attr.type === Types.JSXAttribute && attr.name === name);
    };

    const model = find('v-model');
    if (!model) return;

    const loc = model.loc;
    if (type === Types.JSXCommonElement && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
        throwError(`Only form element and component support 'v-model'`, loc, source);
    }
    if (tag === 'input') {
        const typeAttr = find('type');
        if (typeAttr && (typeAttr.value as ASTAttributeTemplateValue).type !== Types.JSXString) {
            throwError(`If use 'v-model' on 'input' element, the 'type' property of element cannot be dynamic value.`, loc, source);
        }
    }
}

export function validateAttributeForBlock(tag: string, name: string, value: ASTAttributeTemplateValue, loc: SourceLocation, source: string) {
    switch (name) {
        case Directives.If:
        case Directives.ElseIf:
        case Directives.Else:
        case Directives.For:
        case Directives.ForKey:
        case Directives.ForValue:
            break;
        case 'args':
            if (value.type !== Types.JSXString) {
                throwError(`The 'args' attribute of block element '<b:${tag}>' must be a literal string.`, loc, source);
            }
            break;
        case 'params':
            if (value.type !== Types.JSXExpression) {
                throwError(`The 'params' attribute of block element '<b:${tag}>' must be a expression that value is an array.`, loc, source);
            }
            break;
        default:
            throwError(`Block element '<b:${tag}>' does not support the attribute '${name}'.`, loc, source);
    }
}
