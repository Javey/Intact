import {
    isNumber,
    isStringOrNumber,
    throwError,
    isArray,
    isInvalid,
    isNullOrUndefined,
    isString, 
    isFunction,
    isObject,
    error,
} from 'intact-shared';
import {
    VNodeElement, 
    VNode,
    VNodeComponentClass,
    VNodeComponentFunction,
    Children,
    Types,
    ChildrenTypes,
    Key,
    Props,
    TypePrimitive,
    TypeObject,
    TypeDefs,
} from './types';
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

        if (isObject(vNode)) {
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

// @reference Vue
export function validateProps(vNode: VNodeComponentClass | VNodeComponentFunction) {
    const tag = vNode.tag;
    const typeDefs = tag.typeDefs;
    const componentName = getComponentName(tag);
    const props = vNode.props;

    if (isNullOrUndefined(props) || isNullOrUndefined(typeDefs)) return;

    for (let prop in typeDefs) {
        const value = props[prop];
        let expectedType = typeDefs[prop] as TypeObject;

        if (!isPlainObject(expectedType)) {
            expectedType = {type: expectedType};
        }

        if (isNullOrUndefined(value)) {
            let required = expectedType.required;
            if (isFunction(required)) {
                required = required(props);
            }
            if (required) {
                error(`Missing required prop on component "${componentName}": "${prop}".`);
                return;
            } 
            continue;
        }

        let type = expectedType.type;
        if (!isNullOrUndefined(type)) {
            if (!isArray(type))  {
                type = [type];
            }

            let _valid = false;
            let _isStringOrNumber = false;
            const expectedTypes = [];
            
            for (let i = 0; i < type.length; i++) {
                const t = type[i];
                if (isNullOrUndefined(t)) continue;

                const {expectedType, valid, isStringOrNumber} = assertType(value, t);
                expectedTypes.push(expectedType || '');
                _isStringOrNumber = isStringOrNumber;
                if (valid) {
                    _valid = valid;
                    break;
                }
            }

            if (!_valid) {
                error(
                    `Invalid type of prop "${prop}" on component "${componentName}". ` +
                    `Expected ${expectedTypes.join(', ')}, but got ` + 
                    `${toRawType(value, _isStringOrNumber)}.`
                );
                return;
            }
        }

        const validator = expectedType.validator;
        if (validator) {
            const result = validator(value);
            if (result === false) {
                error(`Invalid prop "${prop}" on component "${componentName}": custom validator check failed.`);
            } else if (result !== true) {
                error(`Invalid prop "${prop}" on component "${componentName}": ${result}`);
            }
        }
    }
}

const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;
function assertType(value: any, type: Exclude<TypePrimitive, null | undefined>) {
    if (isNumber(type)) {
        return {valid: type === value, expectedType: type, isStringOrNumber: true};
    } else if (isString(type)) {
        return {valid: type === value, expectedType: `"${type}"`, isStringOrNumber: true};
    }

    let valid: boolean;
    const expectedType = getType(type);

    if (simpleCheckRE.test(expectedType)) {
        const t = typeof value;
        valid = t === expectedType.toLowerCase();

        if (valid && t === 'number' && value !== value) {
            // for NaN
            valid = false;
        } if (!valid && t === 'object') {
            valid = value instanceof type;
        }
    } else if (expectedType === 'Object') {
        valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
        valid = isArray(value);
    } else {
        valid = value instanceof type;
    }

    return {valid, expectedType, isStringOrNumber: false};
}

function getType(type: Function) {
    const match = type && type.toString().match(/^\s*(?:function|class) (\w+)/);
    return match ? match[1] : '';
}

const toString = Object.prototype.toString;
function toRawType(value: any, isStringOrNumber: boolean) {
    if (isStringOrNumber) {
        if (isString(value)) {
            return `"${value}"`;
        }
        return value;
    }

    if (value !== value) return 'NaN';

    return toString.call(value).slice(8, -1);
}

function isPlainObject(value: any): value is object {
    return toString.call(value) === '[object Object]';
}
