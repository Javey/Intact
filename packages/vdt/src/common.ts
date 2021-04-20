// import {
    // Types,
    // TypeTag,
    // TypeString,
    // TypeExpression,
    // TypeChild,
    // TypeAttributeValue,
    // ASTNode,
    // ASTChild,
    // ASTTag,
    // ASTString,
    // ASTExpression,
    // ASTAttribute,
    // Options,
// } from './types';

// export const defaultOptions: Options = {
    // delimiters: ['{', '}'],
// };

// const stringTypes = Types.JS | Types.JSImport | Types.JSXText | Types.JSXComment;
// export function isASTString(node: ASTNode): node is ASTString {
    // return (node.type & stringTypes) > 0;
// }

// export const tagTypes = Types.JSXElement | Types.JSXComponent | Types.JSXVdt | Types.JSXBlock
// export function isASTTag(node: ASTNode): node is ASTTag {
    // return (node.type & tagTypes) > 0;
// }

// const attrMaps: Record<string, string> = {
    // 'class': 'className',
    // 'for': 'htmlFor'
// };
// export const getAttrName = (name: string) => {
    // return attrMaps[name] || name;
// }
