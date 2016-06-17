import {each, isFunction} from 'lodash/fp';

/**
 * inherit
 * @param Parent
 * @param prototype
 * @returns {Function}
 */
export function inherit(Parent, prototype) {
    let Child = (...args) => {
        if (!(this instanceof Child || this.prototype instanceof Child)) {
            return Parent.apply(Child, args);
        }
        return Parent.apply(this, args);
    };

    Child.prototype = Object.create(Parent.prototype);
    each(prototype, function(proto, name) {
        if (name === 'displayName') {
            Child.displayName = proto;
        }
        if (isFunction(proto) || name === 'template') {
            return Child.prototype[name] = proto;
        }
        Child.prototype[name] = (() => {
            let _super = (...args) => Parent.prototype[name].apply(this, args),
                _superApply = (args) => Parent.prototype[name].apply(this, args);
            return (...args) => {
                let__super = this._super,
                    __superApply = this._superApply,
                    returnValue;

                this._super = _super;
                this._superApply = _superApply;

                returnValue = proto.apply(this, args);

                this._super = __super;
                this._superApply = __superApply;

                return returnValue;
            };
        })();
    });
    Child.__super = Parent.prototype;
    Child.prototype.constructor = Child;

    Object.assign(Child, Parent);

    return Child;
}
