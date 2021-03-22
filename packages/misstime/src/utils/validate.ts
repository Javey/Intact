import {isNumber, throwError} from './helpers';
import {VNodeElement, Types, ChildrenTypes} from './types';

export function throwIfObjectIsNotVNode(vNode: any) {
    if (!isNumber(vNode.type)) {
        throwError(
            `normalization received an object that's not a valid VNode,` + 
            ` you should stringify it first or fix createVNode type.` + 
            ` Object: "${JSON.stringify(vNode)}".`
        );
    }
}

export function validateVNodeElementChildren(vNode: VNodeElement<any>) {
    if (vNode.childrenType & ChildrenTypes.HasInvalidChildren) {
        return;
    } 
    if (vNode.type & Types.HtmlElement) {
        const voidTypes: {[key: string]: boolean} = {
            area: true,
            base: true,
            br: true,
            col: true,
            command: true,
            embed: true,
            hr: true,
            img: true,
            input: true,
            textarea: true,
            keygen: true,
            link: true,
            meta: true,
            param: true,
            source: true,
            track: true,
            wbr: true,
            media: true,
        }; 
        const tag = vNode.tag.toLowerCase();

        if (voidTypes[tag]) {
            throwError(`${tag} elements can't have children.`);
        }
    }
}
