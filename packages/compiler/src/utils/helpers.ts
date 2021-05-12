import {ChildrenTypes} from 'misstime';
import {
    Directives,
    ASTTypes,
    SourceLocation,
    ASTNode,
    ASTElement,
    Options,
    ChildrenFlags,
} from './types';
import {
    throwError as sharedThrowError,
    isNull,
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
    /* don't use Directives, because of tree-shaking and performance */
    'v-if': true,
    'v-else-if': true,
    'v-else': true,
    'v-for': true,
    'v-for-value': true,
    'v-for-key': true,
    'v-raw': true,
    // [Directives.If]: true,
    // [Directives.ElseIf]: true,
    // [Directives.Else]: true,
    // [Directives.For]: true,
    // [Directives.ForValue]: true,
    // [Directives.ForKey]: true,
    // // [Directives.Model]: true,
    // [Directives.Raw]: true,
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
    return type === ASTTypes.JSXCommonElement || 
        type === ASTTypes.JSXComponent ||
        type === ASTTypes.JSXVdt ||
        type === ASTTypes.JSXBlock;
}

export function throwError(msg: string, loc: SourceLocation, source: string): never {
    const lines = source.split('\n');
    let {line, column} = loc;
    column;
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

export function computeChildrenFlagForVIf(lastFlag: ChildrenFlags, nextFlag: ChildrenFlags): ChildrenFlags {
    if (lastFlag === ChildrenFlags.UnknownChildren) return lastFlag;

    if (
        lastFlag === ChildrenFlags.HasKeyedVNodeChildren && 
        nextFlag === ChildrenFlags.HasNonKeyedVNodeChildren
    ) {
        return nextFlag;
    }

    return lastFlag & nextFlag;
}

export function computeChildrenFlagForChildren(lastFlag: ChildrenFlags | null, nextFlag: ChildrenFlags): ChildrenFlags {
    if (isNull(lastFlag)) return nextFlag;

    return lastFlag & nextFlag;
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
            /* istanbul ignore next */
            default:
                sharedThrowError('Unknown flag: ' + flag);
        } 
    } else {
        /* istanbul ignore next */
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
}

export const helpersMap = {
    '_$ce': 'createElementVNode',
    '_$cc': 'createUnknownComponentVNode',
    '_$ct': 'createTextVNode',
    '_$ccv': 'createCommentVNode',
    '_$cu': 'createUnescapeTextVNode',
    '_$le': 'linkEvent',

    '_$ma': 'map',
    '_$ex': 'extend',
    '_$stm': 'setTextModel',
    '_$srm': 'setRadioModel',
    '_$scm': 'setCheckboxModel',
    '_$ssm': 'setSelectModel',
    '_$isc': 'isChecked',
    '_$cn': 'className',
    '_$su': 'superCall',

    '_$no': 'noop',
    '_$em': 'EMPTY_OBJ',

    // '_$tr': 'Transtion',
    // '_$tg': 'TransitionGroup',
}
