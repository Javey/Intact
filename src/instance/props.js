import Intact from './constructor';
import {
    result, extend, get, set, castPath, hasOwn,
    keys, isEqual, NextTick, isNullOrUndefined,
    each,
} from '../utils';

Intact._constructors.push(function(props) {
    this.props = extend({}, result(this, 'defaults'), props);

    validateProps(props, this.constructor.propTypes);

    // for compatibility v1.0
    this.attributes = this.props;
});

// function name conflict with utils.get
Intact.prototype.get = function _get(key, defaultValue) {
    if (key === undefined) return this.props;

    return get(this.props, key, defaultValue);
};

Intact.prototype.set = function _set(key, val, options) {
    if (isNullOrUndefined(key)) return this;

    if (typeof key === 'object') {
        options = val;
    } else {
        let obj = {};
        obj[key] = val;
        key = obj;
    }
    options = extend({
        silent: false,
        update: true,
        async: false,
        _fromPatchProps: false,
    }, options);
    // 兼容老版本
    if (hasOwn.call(options, 'global')) {
        options.update = options.global;
    }

    const props = this.props;

    let changes = [];

    if (!options.silent) {
        changes = setProps(key, props);
    } else {
        // 如果静默更新，则直接赋值
        for (let prop in key) {
            set(props, prop, key[prop]);
        }
    }

    if (changes.length) {
        const changeKeys = [];
        for (let i = 0; i < changes.length; i++) {
            const [prop, values] = changes[i];
            changeKeys.push(prop);

            if (options._fromPatchProps) {
                // trigger a $receive event to show that we received a different prop
                this.trigger(`$receive:${prop}`, this, values[1], values[0]);
                // 存在如下情况
                // 当prop为value通过v-model进行双向绑定时，receive事件有可能会修正该value
                // 而修正的过程中，触发了change事件，会去修改绑定的属性
                // 但是下面触发的change事件，又会将绑定的属性置为未修正的值
                // 这会导致死循坏
                // 所以这里将values[1]设为修正后的值，避免死循坏发生
                values[1] = this.get(prop);
            }

            // trigger `change*` events
            this.trigger(`$change:${prop}`, this, values[1], values[0]);
        }

        this.trigger('$change', this, changeKeys);

        if (options.update && this._startRender) {
            if (options.async) {
                if (!this._$nextTick) {
                    this._$nextTick = new NextTick(function(data) {
                        // 将每次改变的属性放入数组
                        this.args.push(data);
                    });
                    this._$nextTick.args = [];
                }

                let self = this;
                this._$nextTick.fire(function() {
                    // 合并执行更新后，触发所有$changed事件
                    const args = this.args;
                    let changes = [];
                    for (let i = 0; i < args.length; i++) {
                        changes = changes.concat(args[i]);
                    }
                    self._$nextTick = null;
                    triggerChange(self, changes);
                }, changes);
            } else {
                triggerChange(this, changes);
            }
        } else if (this.mountedQueue && this._startRender) {
            // 如果是父组件导致子组件更新，此时存在mountedQueue
            // 则在组件数更新完毕，触发$changed事件
            this.mountedQueue.push(() => {
                triggerChangedEvent(this, changes);
            });
        }
    }

    return this;
};

function triggerChange(o, changes) {
    o.update();
    triggerChangedEvent(o, changes);
}

function triggerChangedEvent(o, changes) {
    const changeKeys = [];
    for (let i = 0; i < changes.length; i++) {
        const [prop, values] = changes[i];
        changeKeys.push(prop);

        o.trigger(`$changed:${prop}`, o, values[1], values[0]);
    }
    o.trigger('$changed', o, changeKeys);
}

function setProps(newProps, props) {
    const propsPathTree = {};
    const changes = {};
    const changesWithoutNextValue = [];
    for (let prop in newProps) {
        const nextValue = newProps[prop];
        const lastValue = get(props, prop);

        if (!isEqual(lastValue, nextValue)) {
            let tree = propsPathTree;
            changes[prop] = [lastValue, nextValue];

            if (!hasOwn.call(props, prop)) {
                // a.b.c => ['a', 'b', 'c']
                const paths = castPath(prop);
                const length = paths.length;
                for (let i = 0; i < length; i++) {
                    const name = paths[i]; 
                    if (!tree[name]) {
                        if (i < length - 1) {
                            tree[name] = {};
                            const path = paths.slice(0, i + 1).join('.');
                            changes[path] = [get(props, path)];
                            changesWithoutNextValue.push(path);
                        } else {
                            tree[name] = null;
                        }
                    }
                    tree = tree[name];
                }
                // tree = {a: {b: {c: {}}}}
                // changes = {'a.b.c': [v1, v2], 'a': [v1], 'a.b': [v1]}
            } else {
                tree[prop] = null;
            }
        }

        // 即使相等，也要重新复制，因为有可能引用地址变更
        set(props, prop, nextValue);
    }

    for (let i = 0; i < changesWithoutNextValue.length; i++) {
        let path = changesWithoutNextValue[i];
        changes[path].push(get(props, path));
    }

    return getChanges(propsPathTree, changes);
}

// 深度优先遍历，得到正确的事件触发顺序
function getChanges(tree, data, path, changes = []) {
    for (let key in tree) {
        let _path = path === undefined ? key : `${path}.${key}`;
        if (tree[key]) {
            getChanges(tree[key], data, _path, changes);
        }
        changes.push([_path, data[_path]]);
    }

    return changes;
}

export function validateProps(props, propTypes) {
    console.log(props, propTypes);
    each(props, (value, prop) => {

    });
}
