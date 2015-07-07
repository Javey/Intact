var Widget = VdWidget.extend({
    defaults: {
        name: 'Javey'
    },

    template: '<div ev-click={_.bind(this.change, this)}>{this.get("name")}</div>',

    change: function() {
        this.set('name', 'Hello Javey!');
    }
});

VdWidget.mount(Widget, $('body')[0]);

/**
 * 继承
 */

var Card = VdWidget.extend({
    defaults: {
        title: 'card'
    },

    template: '<div ev-click={_.bind(this.click, this)}>{this.get("title")}</div>',

    click: function() {
        alert('click card');
    }
});

// 继承Card组件
var TableCard = Card.extend({
    click: function() {
        alert('click tableCard');
    }
});

VdWidget.mount(TableCard, $('body')[0]);

var Card1 = VdWidget.extend({
    defaults: {
        title: 'card'
    },

    template: $('#card_template').html(),

    click: function() {
        alert('click card');
    }
});

// 继承Card组件
var TableCard1 = Card1.extend({
    template: $('#tableCard_template').html(),

    click: function() {
        alert('click tableCard');
    }
});

VdWidget.mount(TableCard1, $('body')[0]);

// 继承Card组件
var TableCardThis = Card1.extend({
    template: $('#tableCard_template_this').html(),

    _init: function() {
        // 注入card模板函数
        this.card = Vdt.compile($('#card_template').html());
        // 调用父类_init
        this._super();
    },

    click: function() {
        alert('click tableCard');
    }
});

VdWidget.mount(TableCardThis, $('body')[0]);

// 通过require.js加载模板
require(['/demo/tpl/tableCard.js'], function(template) {
    // 继承Card组件
    var TableCard = Card1.extend({
        template: template,

        click: function() {
            alert('click tableCard which is required by require.js');
        }
    });

    VdWidget.mount(TableCard, $('body')[0]);
});

/**
 * 组合
 */
var ComponentCard = VdWidget.extend({
    template: '<div>{new this.Card({title: "component card"})}</div>',

    _init: function() {
        this.Card = Card;
        this._super();
    }
});

VdWidget.mount(ComponentCard, $('body')[0]);

var ComponentCard1 = VdWidget.extend({
    template: '<div>{widgets.card = new this.Card({title: "component card"})}<div ev-click={_.bind(this.click, this)}>Click Me</div></div>',

    _init: function() {
        // 注入Card组件
        this.Card = Card;
        this._super();
    },

    click: function() {
        // 调用Card的click方法
        this.widgets.card.click();
        alert('You click me');
    }
});
VdWidget.mount(ComponentCard1, $('body')[0]);