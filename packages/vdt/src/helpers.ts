import {IntactElement, ComponentClass, Props, Blocks} from 'misstime';
import {ComponentWithSetterAndGetter, Compile} from './types';
import {
    isArray, 
    isNullOrUndefined,
    throwError,
    isObject,
    isStringOrNumber,
    EMPTY_OBJ,
    isString,
} from 'intact-shared';

export function setTextModel<T extends ComponentWithSetterAndGetter>(component: T, event: Event) {
    const target = event.target as IntactElement;
    component.set(target.$M!, (target as HTMLInputElement).value);
}

export function setRadioModel<T extends ComponentWithSetterAndGetter>(component: T, event: Event) {
    const target = event.target as IntactElement;
    component.set(target.$M!, getValue(target as HTMLInputElement));
}

export function setCheckboxModel<T extends ComponentWithSetterAndGetter>(component: T, event: Event) {
    const target = event.target as IntactElement;
    const modelName = target.$M!;
    const checked = target.checked;
    let trueValue = target.$TV;
    let falseValue = target.$FV;
    let value = component.get(modelName); 

    if (isNullOrUndefined(trueValue)) {
        trueValue = true;
    }
    if (isNullOrUndefined(falseValue)) {
        falseValue = false;
    }

    if (isArray(value)) {
        value = value.slice(0);
        const index = value.indexOf(trueValue);
        if (checked) {
            if (index === -1) {
                value.push(trueValue);
            }
        } else {
            if (index > -1) {
                value.splice(index, 1);
            }
        }
    } else {
        value = checked ? trueValue : falseValue;
    }

    component.set(modelName, value);
}

export function isChecked(value: any, trueValue: any) {
    if (isArray(value)) {
        return value.indexOf(trueValue) > -1;
    } else {
        return value === trueValue;
    }
} 

export function setSelectModel<T extends ComponentWithSetterAndGetter>(component: T, event: Event) {
    const target = event.target as HTMLSelectElement;
    const multiple = target.multiple;
    const options = target.options;
    let value: any | any[];

    if (multiple) {
        value = [];
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            if (opt.selected) {
                value.push(getValue(opt));
            }
        }
    } else {
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            if (opt.selected) {
                value = getValue(opt);
                break;
            }
        }
    }

    component.set((target as IntactElement).$M!, value);
}

function getValue(el: HTMLInputElement | HTMLOptionElement) {
    const value = (el as IntactElement).$VA;
    return isNullOrUndefined(value) ? el.value : value;
}

export function extend(source: Record<string, any>, extra: Record<string, any>) {
    if (extra === EMPTY_OBJ) return source;
    for (let key in extra) {
        source[key] = extra[key];
    }
    return source;
}

export function className(obj?: Record<string, any> | string | number | null) {
    if (isNullOrUndefined(obj)) return null;
    if (isStringOrNumber(obj)) return obj;
    const ret = [];
    for (let key in obj) {
        if (obj[key]) {
            ret.push(key);
        }
    }
    return ret.join(' ');
}

export function map(data: Record<string, any> | Map<any, any> | Set<any> | any[] | null | undefined, iter: (key: any, value: any) => any, thisArg: any) {
    if (isNullOrUndefined(data)) return;
    if (isObject(data)) {
        const ret: any = [];
        const callback = (value: any, key: any) => {
            const result = iter.call(thisArg, value, key);
            if (isArray(result)) {
                ret.push(...result);
            } else {
                ret.push(result);
            }
        };
        if ((data as any).forEach) {
            (data as any).forEach(callback);
        } else if (isArray(data)) {
            /* istanbul ignore next */
            for (let i = 0; i < data.length; i++) {
                callback(data[i], i);
            } 
        } else {
            for (let key in data) {
                callback((data as Record<string, any>)[key], key);
            }
        }

        return ret;
    }

    if (process.env.NODE_ENV !== 'production') {
        throwError(`Cannot handle ${JSON.stringify(data)} for v-for.`);
    }
}

const getPrototypeOf = Object.getPrototypeOf;
export function superCall<T extends ComponentClass>(this: T, props: Props<any>, blocks: Blocks) {
    let superTemplate = getPrototypeOf(getPrototypeOf(this)).constructor.template;
    if (isString(superTemplate)) {
        superTemplate = compile(superTemplate);
    }
    return superTemplate.call(this, props, blocks);
}

let compile: Compile;
export function registerCompile(_compile: Compile) {
    compile = _compile;
}
export {compile};
