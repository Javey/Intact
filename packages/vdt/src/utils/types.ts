import {ComponentClass} from 'misstime';

export const enum ASTTypes {
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
    JSXStrings, // value is a an string array, for text tag
    JSXNone,
}

export interface SourceLocation {
    line: number
    column: number
}

export interface ASTNode {
    type: ASTTypes
    loc: SourceLocation
}

export interface ASTJS extends ASTNode {
    type: ASTTypes.JS
    value: string[]
    spaces: number
}

export interface ASTHoist extends ASTNode {
    type: ASTTypes.JSHoist
    value: string
}

export interface ASTText extends ASTNode {
    type: ASTTypes.JSXText
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
    type: ASTTypes.JSXCommonElement
    hasVRaw: boolean
}

export interface ASTComponent extends ASTBaseElement {
    type: ASTTypes.JSXComponent
}

export interface ASTVdt extends ASTBaseElement {
    type: ASTTypes.JSXVdt
}

export interface ASTBlock extends ASTBaseElement {
    type: ASTTypes.JSXBlock
}

export interface ASTComment extends ASTNode {
    type: ASTTypes.JSXComment
    value: string
}

export interface ASTExpression extends ASTNode {
    type: ASTTypes.JSXExpression
    value: ASTExpressionChild[]
}

export interface ASTAttribute extends ASTNode {
    type: ASTTypes.JSXAttribute
    name: string
    value: ASTAttributeValue
}

export interface ASTNone extends ASTNode {
    type: ASTTypes.JSXNone
}

export interface ASTDirectiveIf extends ASTNode {
    type: ASTTypes.JSXDirectiveIf,
    name: string,
    value: ASTAttributeTemplateValue,
    next: ASTElement | null,
}

export interface ASTString extends ASTNode {
    type: ASTTypes.JSXString
    value: string
}

export interface ASTStrings extends ASTNode {
    type: ASTTypes.JSXStrings,
    value: (ASTText | ASTExpression)[]
}

export interface ASTUnescapeText extends ASTNode {
    type: ASTTypes.JSXUnescapeText
    value: ASTExpressionChild[]
}

export type ASTElement = ASTCommonElement | ASTComponent | ASTVdt | ASTBlock
export type ASTRootChild = ASTHoist | ASTJS | ASTElement | ASTComment
export type ASTExpressionChild = ASTJS | ASTElement | ASTComment | ASTText
export type ASTElementChild = ASTElement | ASTComment | ASTText | ASTExpression | ASTUnescapeText
export type ASTChild = ASTRootChild | ASTExpressionChild | ASTElementChild
export type ASTAttributeTemplateNoneValue = ASTString | ASTExpression | ASTStrings
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
    set<T extends ComponentClass>(component: T, key: string, value: any): void
    get<T extends ComponentClass>(component: T, key: string): any
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
