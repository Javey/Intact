export const enum Types {
    JS,
    JSImport,

    JSXText,
    JSXUnescapeText,
    JSXElement,
    JSXExpressionContainer,
    JSXAttribute,
    JSXEmptyExpression,

    JSXComponent,
    JSXVdt,
    JSXBlock,
    JSXComment,

    JSXDirective,
    JSXTemplate,

    JSXString,
}

export interface ASTNode {
    type: Types
    line: number
    column: number
    // name?: string
    value?: string | ASTNode | ASTNode[] | null
    // children?: ASTElement[]
    // attributes?: ASTAttribute[]
    // directives?: ASTDirective[]
    // hasVRaw?: boolean
}

export interface ASTElement extends ASTNode {
    value: string
    children: ASTElement[]
    attributes: ASTAttribute[]
    directives: ASTDirective[]
    hasVRaw: boolean
}

export interface ASTAttribute extends ASTNode {
    name?: string 
    value: ASTNode 
}

export interface ASTEmptyExpression extends ASTNode {
    value: null 
}

export interface ASTExpressionContainer extends ASTNode {
    value: ASTNode[]
}

// export interface ASTUnescapeText extends ASTNode {
    // value: ASTNode[]
// }

export interface ASTDirective extends ASTNode {
    
}

export type Options = {
    delimiters: [string, string]
}
