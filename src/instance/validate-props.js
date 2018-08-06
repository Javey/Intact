/**
 * 验证属性合法性，参考vue实现
 * 这种实现方式，使用起来很简单，无需引入额外的模块
 * 但是也无法验证复杂的数据结构（需要自己实现验证函数）
 */
import {
    error, isArray, isNullOrUndefined
} from '../utils';

export default function validateProps(props, propTypes) {
    if (!props || !propTypes) return;

    for (let prop in propTypes) {
        const value = props[prop];
        let expectedType = propTypes[prop];
        if (!isPlainObject(expectedType)) {
            expectedType = {type: expectedType};
        }

        if (isNullOrUndefined(value)) {
            if (expectedType.required) {
                error(`Missing required prop: "${prop}".`);
                return;
            } else {
                continue;
            }
        }

        let type = expectedType.type;
        if (type) {
            if (!isArray(type)) {
                type = [type];
            }

            let _valid = false;
            const expectedTypes = [];
            for (let i = 0; i < type.length; i++) {
                const {expectedType, valid} = assertType(value, type[i]);
                expectedTypes.push(expectedType || '');
                if (valid) {
                    _valid = valid;
                    break;
                }
            }

            if (!_valid) {
                error(`Invalid type of prop "${prop}". Expected ${expectedTypes.join(', ')}, got ${toRawType(value)}.`);
                return;
            }
        }

        const validator = expectedType.validator;
        if (validator) {
            const result = validator(value);
            if (result === false) {
                error(`Invalid prop "${prop}": custom validator check failed.`);
                return;
            } else if (result !== true) {
                error(`Invalid prop "${prop}": ${result}`);
                return;
            }
        }
    }
}

const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;
function assertType(value, type) {
    let valid;
    const expectedType = getType(type);

    if (simpleCheckRE.test(expectedType)) {
        const t = typeof value;
        valid = t === expectedType.toLowerCase();

        // for primitive wrapper objects
        if (!valid && t === 'object') {
            valid = value instanceof type;
        }
    } else if (expectedType === 'Object') {
        valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
        valid = isArray(value);
    } else {
        valid = value instanceof type;
    }

    return {valid, expectedType};
}

function getType(fn) {
    const match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : '';
}

const toString = Object.prototype.toString;
function toRawType(value) {
    return toString.call(value).slice(8, -1);
}

function isPlainObject(value) {
    return toString.call(value) === '[object Object]';
}
