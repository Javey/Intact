import {isNumber, isStringOrNumber, throwError, isArray, isInvalid, isNullOrUndefined} from './helpers';
import {VNodeElement, VNode, VNodeComponentClass, Children, Types, ChildrenTypes, Key} from './types';
import {getComponentName} from './common';

export function throwIfObjectIsNotVNode(vNode: any) {
    if (!isNumber(vNode.type)) {
        throwError(
            `normalization received an object that's not a valid VNode,` + 
            ` you should stringify it first or fix createVNode type.` + 
            ` Object: "${JSON.stringify(vNode)}".`
        );
    }
}

export function validateVNodeElementChildren(vNode: VNodeElement) {
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

export function validateKeys(vNode: VNodeElement) {
    if (process.env.NODE_ENV !== 'production') {
        // Checks if there is any key missing or duplicate keys
        if (!vNode.isValidated && vNode.children && vNode.type & Types.CommonElement) {
            const error = getValidateKeysError(
                isArray(vNode.children) ? vNode.children as VNode[] : [vNode.children as VNode],
                (vNode.childrenType & ChildrenTypes.HasKeyedChildren) > 0
            );

            if (error) {
                throwError(error + getTagName(vNode));
            }
        }
        vNode.isValidated = true;
    }
}

function getValidateKeysError(vNodes: VNode[], forceKeyed: boolean): string | undefined {
    const foundKeys: Record<Key, true> = {};

    for (let i = 0; i < vNodes.length; i++) {
        const vNode = vNodes[i];

        if (isArray(vNode)) {
            return 'Encounterd ARRAY in mount, array must be flattened, or normalize used. Location: \n' + getTagName(vNode);
        }

        if (isInvalid(vNode)) {
            if (forceKeyed) {
                return 'Encountered invalid node when preparing to keyed algorithm. Location: \n' + getTagName(vNode);
            } else if (Object.keys(foundKeys).length !== 0) {
                return 'Encountered invalid node with mixed keys. Location: \n' + getTagName(vNode);
            }
            continue;
        }

        if (typeof vNode === 'object') {
            if (vNode.isValidated) {
                continue;
            }
            vNode.isValidated = true;
        }

        const key = vNode.key;

        if (!isNullOrUndefined(key) && !isStringOrNumber(key)) {
            return 'Encountered child vNode where key property is not string or number. Location: \n' + getTagName(vNode);
        }

        const {children, childrenType} = vNode;
        if (!isInvalid(children)) {
            let error: string | undefined;
            if (childrenType & ChildrenTypes.MultipleChildren) {
                error = getValidateKeysError(children as VNode[], (childrenType & ChildrenTypes.HasKeyedChildren) !== 0);
            } else if (childrenType === ChildrenTypes.HasVNodeChildren) {
                error = getValidateKeysError([children as VNode], false);
            }

            if (error) {
                return error + getTagName(vNode);
            }
        }

        if (forceKeyed && isNullOrUndefined(key)) {
            return 'Encountered child without key during keyed algorithm. If this error points to Array make sure children is flat list. Location: \n' + getTagName(vNode);
        } else if (!forceKeyed && isNullOrUndefined(key)) {
            if (Object.keys(foundKeys).length !== 0) {
                return 'Encountered children with key missing. Location: \n' + getTagName(vNode);
            }
            continue;
        }
        if (foundKeys[key!]) {
            return 'Encountered two children with same key: {' + key + '}. Location: \n' + getTagName(vNode);
        }
        foundKeys[key!] = true;
    }
}

function getTagName(vNode: Children) {
    let tagName: string;

    if (isArray(vNode)) {
        const arrayText = vNode.length > 3 ? vNode.slice(0, 3).toString() + ',...' : vNode.toString();
        tagName = `Array(${arrayText})`;
    } else if (isStringOrNumber(vNode)) {
        tagName = `Text(${vNode})`;
    } else if (isInvalid(vNode)) {
        tagName = `InvalidVNode(${vNode})`;
    } else {
        const type = vNode.type;

        if (type & Types.Element) {
            tagName = `<${vNode.tag}${vNode.className ? ` class="${vNode.className}"`: ''}>`;
        } else if (type & Types.Text || type & Types.Void) {
            tagName = `Text(${vNode.children})`;
        } else if (type & Types.HtmlComment) {
            tagName = `Comment(${vNode.children})`;
        } else {
            tagName = `<${getComponentName((vNode as VNodeComponentClass).tag)} />`;
        }
    }

    return `>> ${tagName}\n`;
}
