import {result, extend} from './utils';

let Thunk = function(Widget, attributes, contextWidget) {
    this.Widget = Widget;
    this.attributes = attributes || {};
    this.key = this.attributes.key;
    this.contextWidget = contextWidget;
};

Thunk.prototype = {
    constructor: Thunk,

    type: 'Thunk',

    render(previous) {
        if (!previous || previous.Widget !== this.Widget || previous.key !== this.key) {
            this.widget = new this.Widget(this.attributes, this.contextWidget);
        } else if (previous.Widget === this.Widget) {
            if (!previous.widget) throw new Error('Don\'t update when updating.');

            let widget = this.widget = previous.widget;
            widget.children = this.attributes.children;
            delete this.attributes.children;

            // 如果存在arguments属性，则将其拆开赋给attributes
            if (this.attributes.arguments) {
                extend(this.attributes, result(this.attributes, 'arguments'));
                delete this.attributes.arguments;
            }

            widget.removeEvents();
            widget.addEvents(this.attributes);
            widget.set(this.attributes, {global: false});

            // 当一个组件，用同一个组件的另一个实例，去更新自己，由于子组件都相同
            // 所以子组件不会新建，也就写入不了新实例的widgets引用中，这里强制设置一遍
            this.contextWidget[this.widget._widget] = this.widget;
        }

        return this.widget;
    }
};

export default Thunk;
