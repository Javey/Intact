import {autobind, templateDecorator} from '../utils';
import Vdt from 'vdt/src/client';

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

    for (let i = 0; i < Intact._constructors.length; i++) {
        Intact._constructors[i].call(this, props);
    }
}

Intact._constructors = [];

// ES7 Decorator for template
if (Object.defineProperty) {
    Object.defineProperty(Intact, 'template', {
        configurable: false,
        enumerable: false,
        value: templateDecorator,
        writable: true,
    });
}
