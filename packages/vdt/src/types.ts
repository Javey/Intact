// compute value advanced to make it can be used as type
// export const enum Types {
    // JS = 1,
    // JSImport = 2, // 1 << 1,

    // JSXText = 4, // 1 << 2,
    // JSXUnescapeText = 8, // 1 << 3,
    // JSXElement = 16, // 1 << 4,
    // JSXComponent = 32, //1 << 5,
    // JSXVdt = 64, // 1 << 6,
    // JSXBlock = 128, // 1 << 7,
    // JSXComment = 256, // 1 << 8,

    // JSXExpression = 512, // 1 << 9,
    // // JSXEmptyExpression = 1 << 11,

    // JSXAttribute = 1024, // 1 << 10,
    // JSXDirective = 2048, // 1 << 11,

    // JSXString = 8192, // 1 << 13,

    // // special flag
    // Skip = 16384, // 1 << 14,
    // HasVRaw = 32768, // 1 << 15 
    // HasKey = 65536, // 1 << 16

    // // Tag = JSXElement | JSXComponent | JSXVdt | JSXBlock,
    // // String = JS | JSImport | JSXText | JSXComment,
    // // Expression = JSXUnescapeText | JSXExpression,
    // // Child = String | Expression | Tag,
    // // AttributeValue = JSXString | JSXExpression
// }

// export type TypeTag = Types.JSXElement | Types.JSXComponent | Types.JSXVdt | Types.JSXBlock;
// export type TypeString = Types.JS | Types.JSImport | Types.JSXText | Types.JSXComment;
// export type TypeExpression = Types.JSXUnescapeText | Types.JSXExpression;
// export type TypeChild = TypeString | TypeExpression | TypeTag;
// export type TypeAttributeValue = Types.JSXString | Types.JSXExpression;

export const enum Types {
    JS,
    JSHoist,

    JSXText,
    JSXCommonElement,
    JSXComponent,
    JSXComment,
    JSXVdt,
    JSXBlock,
    JSXExpression,

    JSXAttribute,
    JSXString,
}

export interface SourceLocation {
    line: number
    column: number
}

export interface ASTNode {
    type: Types
    loc: SourceLocation
}

export interface ASTJS extends ASTNode {
    type: Types.JS
    value: string
}

export interface ASTHoist extends ASTNode {
    type: Types.JSHoist
    value: string
}

export interface ASTText extends ASTNode {
    type: Types.JSXText
    value: string
}

export interface ASTBaseElement extends ASTNode {
    value: string
    attributes: (ASTAttribute | ASTExpression)[]
    directives: Record<string, ASTAttribute>, 
    children: ASTChild[]
    keyed: boolean
}

export interface ASTCommonElement extends ASTBaseElement {
    type: Types.JSXCommonElement
    hasVRaw: boolean
}

export interface ASTComponent extends ASTBaseElement {
    type: Types.JSXComponent
}

export interface ASTVdt extends ASTBaseElement {
    type: Types.JSXVdt
}

export interface ASTBlock extends ASTBaseElement {
    type: Types.JSXBlock
}

export interface ASTComment extends ASTNode {
    type: Types.JSXComment
    value: string
}

export interface ASTExpression extends ASTNode {
    type: Types.JSXExpression
    value: ASTExpressionChild[]
    unescaped: boolean
}

export interface ASTAttribute extends ASTNode {
    type: Types.JSXAttribute
    name: string
    value: ASTString | ASTExpression
}

export interface ASTString extends ASTNode {
    type: Types.JSXString
    value: string
}

export type ASTElement = ASTCommonElement | ASTComponent | ASTVdt | ASTBlock
export type ASTRootChild = ASTHoist | ASTJS | ASTElement | ASTComment
export type ASTExpressionChild = ASTJS | ASTElement | ASTComment | ASTText
export type ASTElementChild = ASTElement | ASTComment | ASTText | ASTExpression
export type ASTChild = ASTRootChild | ASTExpressionChild | ASTElementChild

export const enum Directives {
    If = 'v-if',
    ElseIf = 'v-else-if',
    Else = 'v-else',
    For = 'v-for',
    ForValue = 'v-for-value',
    ForKey = 'v-for-key',
    Model = 'v-model',
    Raw = 'v-raw',
}

// export interface ASTChild extends ASTNode {
    // prev: ASTChild | null
    // next: ASTChild | null
// }

// export interface ASTTag extends ASTChild {
    // value: string
    // children: ASTChild[]
    // attributes: (ASTAttribute | ASTExpression)[]
    // directives: Record<string, ASTAttribute>
// }

// export interface ASTString extends ASTChild {
    // value: string 
// }

// export interface ASTExpression extends ASTChild {
    // value: ASTChild[]
// }

// export interface ASTAttribute extends ASTNode {
    // name: string
    // value: ASTString | ASTExpression
// }

export interface DirectiveFor {
    data: ASTExpression,
    value?: ASTString,
    key?: ASTString
}

export type Options = {
    delimiters: [string, string]
}
