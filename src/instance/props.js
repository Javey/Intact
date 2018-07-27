import Intact from './constructor';
import {
    result, extend, get, set, castPath, hasOwn,
    keys, isEqual, NextTick, isNullOrUndefined,
} from '../utils';

Intact._constructors.push(function(props) {
    props = extend({}, result(this, 'defaults'), props);

    this.props = {};
    this.set(props, {silent: true});
    
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

    let isSetByObject = false;
    if (typeof key === 'object') {
        options = val;
        isSetByObject = true;
    } else {
        // 如果不是批量设置，则强制分析path
        options = extend({}, options, {
            path: true
        });
    }
    options = extend({
        silent: false,
        update: true,
        async: false,
        _fromPatchProps: false,
        path: false,
    }, options);
    // 兼容老版本
    if (hasOwn.call(options, 'global')) {
        options.update = options.global;
    }

    const props = this.props;
    const changes = {};

    let hasChanged = false;

    // 前面做了undefined的判断，这里不可能为undefined了
    if (isSetByObject) {
        if (!options.silent) {
            for (let prop in key) {
                let nextValue = key[prop];
                let lastValue = props[prop];
                if (!isEqual(lastValue, nextValue)) {
                    changes[prop] = [lastValue, nextValue];
                    hasChanged = true;
                }
                // 即使相等，也要重新复制，因为有可能引用地址变更
                props[prop] = nextValue;
            }
        } else {
            // 如果静默更新，则直接赋值
            extend(props, key);
        }
    } else {
        if (!options.silent) {
            let lastValue = get(props, key);
            if (!isEqual(lastValue, val)) {
                if (!hasOwn.call(props, key)) {
                    changes[key] = [lastValue, val];
                    let path = castPath(key);
                    // 如果是像'a.b.c'这样设置属性，而该属性不存在
                    // 依次触发change:a.b.c、change:a.b、change:a这样的事件
                    // 先不设置props，去取老值
                    let _props = [];
                    for (let i = path.length - 1; i > 0; i--) {
                        let prop = path.slice(0, i).join('.');
                        let _lastValue = get(props, prop);
                        changes[prop] = [_lastValue];
                        _props.push(prop);
                    }
                    // 设置props后，去取新值
                    // 对于引用数据类型，新老值可能一样
                    set(props, key, val);
                    for (let i = 0; i < _props.length; i++) {
                        let prop = _props[i];
                        changes[prop].push(get(props, prop));
                    }
                } else {
                    // 否则，只触发change:a.b.c
                    changes[key] = [lastValue, val];
                    set(props, key, val);
                }

                hasChanged = true;
            } else {
                set(props, key, val);
            }
        } else {
            set(props, key, val);
        }
    }

    if (hasChanged) {
        for (let prop in changes) {
            let values = changes[prop];
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
        const changeKeys = keys(changes);

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
                    let changes = {};
                    for (let i = 0; i < args.length; i++) {
                        extend(changes, args[i]); 
                    }
                    self._$nextTick = null;
                    triggerChange(self, changes, keys(changes));
                }, changes);
            } else {
                triggerChange(this, changes, changeKeys);
            }
        } else if (this.mountedQueue && this._startRender) {
            // 如果是父组件导致子组件更新，此时存在mountedQueue
            // 则在组件数更新完毕，触发$changed事件
            this.mountedQueue.push(() => {
                triggerChangedEvent(this, changes, changeKeys);
            });
        }
    }

    return this;
};

function triggerChange(o, changes, changeKeys) {
    o.update();
    triggerChangedEvent(o, changes, changeKeys);
}

function triggerChangedEvent(o, changes, changeKeys) {
    for (let prop in changes) {
        let values = changes[prop];
        o.trigger(`$changed:${prop}`, o, values[1], values[0]);
    }
    o.trigger('$changed', o, changeKeys);
}
