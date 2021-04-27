import {
    Directives,
    Types,
    SourceLocation,
    ASTChild,
    ASTNode,
    ASTElement,
    ASTAttribute,
    ASTAttributeTemplateValue,
    Options,
    ChildrenFlags,
} from './types';
import {Component, IntactElement, ChildrenTypes} from 'misstime';
import {
    isArray, 
    isNullOrUndefined,
    throwError as sharedThrowError,
    isUndefined,
    isObject,
} from 'intact-shared';

export function trimRight(str: string) {
    var index = str.length;

    while (index-- && isWhiteSpace(str.charCodeAt(index))) {}

    return str.slice(0, index + 1);
}

export function isWhiteSpace(charCode: number) {
    return (
        (charCode <= 160 && (charCode >= 9 && charCode <= 13) || 
            charCode == 32 || 
            charCode == 160
        ) ||
        charCode == 5760 || 
        charCode == 6158 ||
        (charCode >= 8192 && 
            (
                charCode <= 8202 || 
                charCode == 8232 ||
                charCode == 8233 || 
                charCode == 8239 || 
                charCode == 8287 || 
                charCode == 12288 || 
                charCode == 65279
            )
        )
    );
}

export const selfClosingTags: Record<string, true> = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'command': true,
    'embed': true,
    'hr': true,
    'img': true,
    'input': true,
    'keygen': true,
    'link': true,
    'menuitem': true,
    'meta': true,
    'param': true,
    'source': true,
    'track': true,
    'wbr': true
};

export const textTags: Record<string, true> = {
    style: true,
    script: true,
    textarea: true
}

export const directivesMap: Record<Directives, true> = {
    [Directives.If]: true,
    [Directives.ElseIf]: true,
    [Directives.Else]: true,
    [Directives.For]: true,
    [Directives.ForValue]: true,
    [Directives.ForKey]: true,
    // [Directives.Model]: true,
    [Directives.Raw]: true,
};

export function isJSIdentifierPart(ch: number) {
    return (ch === 95) || ch === 36 ||  // _ (underscore) $
        (ch >= 65 && ch <= 90) ||         // A..Z
        (ch >= 97 && ch <= 122) ||        // a..z
        (ch >= 48 && ch <= 57);         // 0..9
}

export function isJSXIdentifierPart(ch: number) {
    return (ch === 58) || (ch === 45) || ch === 46 || isJSIdentifierPart(ch);  // : - .
}

export function isWhiteSpaceExceptLinebreak(charCode: number) {
    return charCode !== 10 && // \n
        charCode !== 13 && // \r
        isWhiteSpace(charCode);
}

export function isElementNode(node: ASTNode): node is ASTElement {
    const type = node.type;
    return type === Types.JSXCommonElement || 
        type === Types.JSXComponent ||
        type === Types.JSXVdt ||
        type === Types.JSXBlock;
}

export function throwError(msg: string, loc: SourceLocation, source: string): never {
    const lines = source.split('\n');
    let {line, column} = loc;
    column++;
    const error = new Error(
        `${msg} (${line}:${column})\n` +
        `> ${line} | ${lines[line - 1]}\n` +
        `  ${new Array(String(line).length + 1).join(' ')} | ${new Array(column).join(' ')}^`
    );

    throw error;
}

const attrMaps: Record<string, string> = {
    'class': 'className',
    'for': 'htmlFor'
};
export const getAttrName = (name: string) => {
    return attrMaps[name] || name;
}

export const defaultOptions: Options = {
    delimiters: ['{', '}'],
};

function getValue(el: HTMLInputElement | HTMLOptionElement) {
    const value = (el as IntactElement).$VA;
    return isNullOrUndefined(value) ? el.value : value;
}

export function setRadioModel(component: Component<any>, event: Event) {
    const target = event.target as IntactElement;
    component.set(target.$M!, getValue(target as HTMLInputElement));
}

export function setCheckboxModel(component: Component<any>, event: Event) {
    const target = event.target as IntactElement;
    const modelName = target.$M!;
    const checked = target.checked;
    let trueValue = target.$TV;
    let falseValue = target.$FV;
    let value = component.get(modelName); 

    if (isNullOrUndefined(trueValue)) {
        trueValue = true;
    }
    if (isNullOrUndefined(falseValue)) {
        falseValue = false;
    }

    if (isArray(value)) {
        value = value.slice(0);
        const index = value.indexOf(trueValue);
        if (checked) {
            if (index === -1) {
                value.push(trueValue);
            }
        } else {
            if (index > -1) {
                value.splice(index, 1);
            }
        }
    } else {
        value = checked ? trueValue : falseValue;
    }

    component.set(modelName, value);
}

export function isChecked(value: any, trueValue: any) {
    if (isArray(value)) {
        return value.indexOf(trueValue) > -1;
    } else {
        return value === trueValue;
    }
} 

export function setSelectModel(component: Component<any>, event: Event) {
    const target = event.target as HTMLSelectElement;
    const multiple = target.multiple;
    const options = target.options;
    let value: any | any[];

    if (multiple) {
        value = [];
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            if (opt.selected) {
                value.push(getValue(opt));
            }
        }
    } else {
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            if (opt.selected) {
                value = getValue(opt);
                break;
            }
        }
    }

    component.set((target as IntactElement).$M!, value);
}

export function map(data: Record<string, any> | Map<any, any> | Set<any> | any[], iter: (key: any, value: any) => any, thisArg: any) {
    if (isObject(data)) {
        const ret: any = [];
        const callback = (value: any, key: any) => {
            const result = iter.call(thisArg, value, key);
            if (isArray(result)) {
                ret.push(...result);
            } else {
                ret.push(result);
            }
        };
        if ((data as any).forEach) {
            (data as any).forEach(callback);
        } else if (isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                callback(data[i], i);
            } 
        } else {
            for (let key in data) {
                callback((data as Record<string, any>)[key], key);
            }
        }

        return ret;
    }

    if (process.env.NODE_ENV !== 'production') {
        if (!isNullOrUndefined(data)) {
            sharedThrowError(`Cannot handle ${typeof data} for ${Directives.For}.`);
        }
    }

    return null;
}

export function computeChildrenFlagForVIf(lastFlag: ChildrenFlags, nextFlag: ChildrenFlags): ChildrenFlags {
    if (lastFlag === ChildrenFlags.UnknownChildren) return lastFlag;

    if (
        lastFlag === ChildrenFlags.HasKeyedVNodeChildren && 
        nextFlag === ChildrenFlags.HasNonKeyedVNodeChildren ||
        lastFlag === ChildrenFlags.HasKeyedChildren &&
        nextFlag === ChildrenFlags.HasNonKeyedChildren
    ) return nextFlag; 

    return lastFlag & nextFlag;
}

export function computeChildrenFlagForChildren(lastFlag: ChildrenFlags | undefined, nextFlag: ChildrenFlags): ChildrenFlags {
    if (isUndefined(lastFlag)) return nextFlag;
    if (lastFlag === ChildrenFlags.UnknownChildren) return lastFlag;

    if (lastFlag === nextFlag) {
        if (nextFlag === ChildrenFlags.HasKeyedVNodeChildren) {
            return ChildrenFlags.HasKeyedVNodeChildren;
        } else if (nextFlag === ChildrenFlags.HasNonKeyedVNodeChildren) {
            return ChildrenFlags.HasNonKeyedChildren;
        }
    }

    return ChildrenFlags.UnknownChildren;
}

export function childrenFlagToChildrenType(flag: ChildrenFlags): ChildrenTypes | string {
    if (process.env.NODE_ENV !== 'production') {
        switch (flag) {
            case ChildrenFlags.UnknownChildren:
                return `${ChildrenTypes.UnknownChildren} /* UnknownChildren */`;
            case ChildrenFlags.HasInvalidChildren:
                return `${ChildrenTypes.HasInvalidChildren} /* HasInvalidChildren */`;
            case ChildrenFlags.HasKeyedVNodeChildren:
            case ChildrenFlags.HasNonKeyedVNodeChildren:
                return `${ChildrenTypes.HasVNodeChildren} /* HasVNodeChildren */`;
            case ChildrenFlags.HasKeyedChildren:
                return `${ChildrenTypes.HasKeyedChildren} /* HasKeyedChildren */`;
            case ChildrenFlags.HasNonKeyedChildren:
                return `${ChildrenTypes.HasNonKeyedChildren} /* HasNonKeyedChildren */`;
            case ChildrenFlags.HasTextChildren:
                return `${ChildrenTypes.HasTextChildren} /* HasTextChildren */`;
            default:
                sharedThrowError('Unknown flag: ' + flag);
        } 
    }
    switch (flag) {
        case ChildrenFlags.UnknownChildren:
            return ChildrenTypes.UnknownChildren;
        case ChildrenFlags.HasInvalidChildren:
            return ChildrenTypes.HasInvalidChildren;
        case ChildrenFlags.HasKeyedVNodeChildren:
        case ChildrenFlags.HasNonKeyedVNodeChildren:
            return ChildrenTypes.HasVNodeChildren;
        case ChildrenFlags.HasKeyedChildren:
            return ChildrenTypes.HasKeyedChildren;
        case ChildrenFlags.HasNonKeyedChildren:
            return ChildrenTypes.HasNonKeyedChildren;
        case ChildrenFlags.HasTextChildren:
            return ChildrenTypes.HasTextChildren;
        default:
            sharedThrowError('Unknown flag: ' + flag);
    } 
}

export const helpersMap = {
    '_$ce': 'createElementVNode',
    '_$cc': 'createComponentVNode',
    '_$ct': 'createTextVNode',
    '_$ccv': 'createCommentVNode',
    '_$cu': 'createUnescapeTextVNode',
    '_$le': 'linkEvent',
    '_$ma': 'map',
    '_$ex': 'extends',
    '_$sm': 'setModel',
    '_$srm': 'setRadioModel',
    '_$scm': 'setCheckboxModel',
    '_$ssm': 'setSelectModel',
    '_$ic': 'isChecked',
    '_$cn': 'className',
    '_$no': 'noop',
}
