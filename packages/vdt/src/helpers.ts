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
} from './types';

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
    [Directives.Model]: true,
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

export function validateDirectiveValue(name: string, valueType: Types, tag: string, tagType: Types, source: string, loc: SourceLocation) {
    if (name === Directives.Raw) {
        if (tagType !== Types.JSXCommonElement) {
            throwError(`Only html elememt supports v-raw, but got: ${tag}`, loc, source);
        }
    } else if (name === Directives.ForKey || name === Directives.ForValue) {
        if (valueType !== Types.JSXString) {
            throwError(`'${name}' must be a literal string.`, loc, source);
        }
    } else if (name === Directives.For || name === Directives.If || name === Directives.ElseIf || name === Directives.Else) {
        if (valueType !== Types.JSXExpression) {
            throwError(`'${name}' must be a expression.`, loc, source);
        }
    }
}

export function validateDirectiveIF(children: ASTChild[], loc: SourceLocation, source: string) {
    let inIf = false;
    children.forEach(child => {
        // ignore comment
        if (child.type === Types.JSXComment) return;

        if (isElementNode(child)) {
            const directives = child.directives;
            if (directives[Directives.Else] || directives[Directives.ElseIf]) {
                if (!inIf) {
                    throwError(`'${Directives.Else || Directives.ElseIf}' must be lead with 'v-if' or 'v-else-if'`, loc, source); 
                }
            } else if (directives[Directives.If]) {
                inIf = true;
            } else {
                inIf = false;
            }
        } else {
            inIf = false;
        }
    });
}

export function validateDirectiveModel(tag: string, type: Types, attributes: ASTElement['attributes'], loc: SourceLocation, source: string) {
    if (type === Types.JSXCommonElement && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
        throwError(`Only form element and component support 'v-model'`, loc, source);
    }
    if (tag === 'input') {
        const typeAttr = attributes.find(attr => {
            return attr.type === Types.JSXAttribute && attr.name === 'type';
        }) as ASTAttribute;
        if (typeAttr && (typeAttr.value as ASTAttributeTemplateValue).type !== Types.JSXString) {
            throwError(`If use 'v-model' on 'input' element, the 'type' property of element cannot be dynamic value.`, loc, source);
        }
    }
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

