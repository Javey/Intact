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
    JSXDirectiveIf,
    JSXUnescapeText,

    JSXAttribute,
    JSXString,
    JSXNone,
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
    directives: {[key in DirectiveCommon]?: ASTAttribute} & {[key in DirectiveIf]?: ASTDirectiveIf}, 
    children: ASTElementChild[]
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
}

export interface ASTAttribute extends ASTNode {
    type: Types.JSXAttribute
    name: string
    value: ASTAttributeValue
}

export interface ASTNone extends ASTNode {
    type: Types.JSXNone
}

export interface ASTDirectiveIf extends ASTNode {
    type: Types.JSXDirectiveIf,
    name: string,
    value: ASTAttributeTemplateValue,
    next: ASTElement | null,
}

export interface ASTString extends ASTNode {
    type: Types.JSXString
    value: string
}

export interface ASTUnescapeText extends ASTNode {
    type: Types.JSXUnescapeText
    value: ASTExpressionChild[]
}

export type ASTElement = ASTCommonElement | ASTComponent | ASTVdt | ASTBlock
export type ASTRootChild = ASTHoist | ASTJS | ASTElement | ASTComment
export type ASTExpressionChild = ASTJS | ASTElement | ASTComment | ASTText
export type ASTElementChild = ASTElement | ASTComment | ASTText | ASTExpression | ASTUnescapeText
export type ASTChild = ASTRootChild | ASTExpressionChild | ASTElementChild
export type ASTAttributeTemplateNoneValue = ASTString | ASTExpression
export type ASTAttributeTemplateValue = ASTAttributeTemplateNoneValue | ASTNone
export type ASTAttributeValue = ASTAttributeTemplateValue | ASTElementChild | ASTElementChild[]

export const enum Directives {
    If = 'v-if',
    ElseIf = 'v-else-if',
    Else = 'v-else',
    For = 'v-for',
    ForValue = 'v-for-value',
    ForKey = 'v-for-key',
    Raw = 'v-raw',
}

export type DirectiveIf = Directives.If | Directives.ElseIf | Directives.Else
export type DirectiveCommon = Exclude<Directives, DirectiveIf>

export interface DirectiveFor {
    data: ASTExpression,
    value?: ASTString,
    key?: ASTString
}

export type Options = {
    delimiters: [string, string]
}

export const enum ChildrenFlags {
    UnknownChildren = 0,
    HasInvalidChildren = 1,
    HasKeyedVNodeChildren = 1 << 1,
    HasNonKeyedVNodeChildren = 1 << 2,
    HasKeyedChildren = 1 << 3,
    HasNonKeyedChildren = 1 << 4,
    HasTextChildren = 1 << 5,

    VNodeChildren = HasKeyedVNodeChildren | HasNonKeyedVNodeChildren,
    KeydChildren = HasKeyedVNodeChildren | HasKeyedChildren,
    NonKeydChildren = HasNonKeyedVNodeChildren | HasNonKeyedChildren,
}
