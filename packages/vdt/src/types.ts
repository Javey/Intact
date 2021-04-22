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
    value: string[]
    spaces: number
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
    children: ASTElementChild[]
    keyed: boolean
    // skip?: boolean
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
    value: ASTAttributeValue
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
export type ASTAttributeTemplateValue = ASTString | ASTExpression
export type ASTAttributeValue = ASTAttributeTemplateValue | ASTElementChild | ASTElementChild[]

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

export interface DirectiveFor {
    data: ASTExpression,
    value?: ASTString,
    key?: ASTString
}

export type Options = {
    delimiters: [string, string]
}
