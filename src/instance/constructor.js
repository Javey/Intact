import {
    autobind, templateDecorator, each, extend,
    uniqueId, result, isArray, error
} from '../utils';
import Vdt from 'vdt/src/client';
import validateProps from './validate-props';
import {isEventProp} from 'misstime/src/utils';

export default function Intact(props) {
    let template = this.constructor.template;
    // Intact.template is a decorator
    if (!template || template === templateDecorator) {
        template = this.template;
    }
    if (!template) {
        throw new Error('Can not instantiate when template does not exist.');
    }

    // for debug
    this.displayName = this.displayName;
     
    // autobind this for methods
    // in ie 8 we must get prototype through constructor first time
    autobind(this.constructor.prototype, this, Intact, {});
    
    this.vdt = Vdt(template);

    // for string ref
    this.refs = this.vdt.widgets || {};
    // for compatibility v1.0
    this.widgets = this.refs;

    this.props = {};

    this.uniqueId = this.props.widget || uniqueId('widget');

    // for compatibility v1.0
    this.attributes = this.props;
    this._widget =  this.uniqueId;

    this._events = {};
    this._keptEvents = {}; // save the events that do not off when destroyed

    // lifecycle states
    this.inited = false;
    this.rendered = false;
    this.mounted = false;
    this.destroyed = false;

    // if the flag is false, any set operation will not lead to update 
    this._startRender = false;

    this._updateCount = 0;
    this._pendingUpdate = null;
    this._pendingChangedEvents = [];

    this.mountedQueue = null;

    this._constructor(props);
}

Intact.prototype._constructor = function(props) {
    if (process.env.NODE_ENV !== 'production') {
        validateProps(props, this.constructor.propTypes, this.displayName || this.constructor.name);
    }

    extend(this.props, result(this, 'defaults'), props);

    // bind events
    each(props, (value, key) => {
        if (isEventProp(key)) {
            if (isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    if (value[i]) {
                        this.on(key.substr(3), value[i]);
                    }
                }
            } else if (value) {
                this.on(key.substr(3), value);
            }
        }
    });

    const inited = () => {
        this.inited = true;

        // trigger $receive event when initialize component
        let keys = [];
        each(props, (value, key) => {
            this.trigger(`$receive:${key}`, this, value);
            keys.push(key);
        });
        if (keys.length) {
            this.trigger(`$receive`, this, keys);
        }
        this.trigger('$inited', this);
    };
    const ret = this._init();

    if (ret && ret.then) {
        ret.then(inited, err => {
            error('Unhandled promise rejection in _init: ', err);
            inited();
        });
    } else {
        inited();
    }
};

// for intact compatibility layer to inherit it
Intact.template = templateDecorator;
