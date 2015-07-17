# VdWidget

## 简介

一个基于`virtual-dom`编写数据单向绑定web组件的js库，能够实现组件之间的组合、继承。
如果你是`jQuery`深度开发者，不想去了解各种复杂的框架的使用方法，但又想写出高可维护的代码，`VdWidget`是你的一种选择。

那为什么不直接使用`React.js`呢？原因很简单：我是一位`jQuery`深度开发着。

## 动机

我需要一个库/框架，能够实现以下两点：

1. 数据绑定，能够实现数据更新后UI能够自动更新
2. UI更新可控，我可以更新数据但阻止UI自动更新，另外我能知道什么时候UI更新完成，我可以在更新完成后，直接操作dom。

感谢`React.js`及`virtual-dom`，让一切变得简单。

这个项目基于之前的一个项目`vdt.js`，那是一个纯前端模板工具，需要自己控制UI更新。这个工具对其进行了一层封装，使其可以简单地编写web组件。

## 安装

```
bower install vdwidget --save
```

## 依赖

必须

1. underscore
2. vdt.js

可选

1. jquery
2. require.js

在引入`vdWidget.js`之前，先加载依赖文件，或者通过`amd`加载

## 示例

```js
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
```

## 使用方法

### 第一个Widget

创建一个widget分为以下几步

1. 通过`VdWidget.extend`创建widget

    ```js
    var Widget = VdWidget.extend();
    ```

2. 给widget提供默认数据，通过指定`defaults`字段

    ```js
    var Widget = VdWidget.extend({
        defaults: {
            name: 'Javey'
        }
    });
    ```

3. 指定模板，模板可以是字符串，也可以是已经编译好的模板函数，参见`vdt.js`。模板函数，可以前端编译，也可以后端编译通过amd加载。模板语法为`JSX`，最后一个元素必须用html标签包起来。

    ```js
    var Widget = VdWidget.extend({
        defaults: {
            name: 'Javey'
        },

        template: '<div ev-click={_.bind(this.change, this)}>{this.get("name")}</div>'
    });
    ```

4. 通过`VdWidget.mount` appendChild到指定的dom中，只有`root widget`才需要这么做

    ```js
    ...

    VdWidget.mount(Widget, document.body);
    ```

### 模板

模板写法参考`vdt.js`。在模板中`this`指向该widget实例，所以可以直接访问该widget的属性和方法。

#### 获取数据

##### this.get([key])

* @param `key` {String} 要获取数据的名称，不指定则获取所有数据
* @return {*} 返回指定的key的值

#### 绑定事件

通过`ev-event`的方式指定需要绑定的事件和相应方法。如果需要调用组件提供的方法，则需要通过`bind`绑定`this`

```jsx
<div ev-click={_.bind(this.change, this)}></div>
// es5可以这么做
<div ev-click={this.change.bind(this)}></div>
// 还可以这么做
var self = this;
<div ev-click={function() {self.change()}}></div>
```

如果需要传入数据
```jsx
// 'Hi'将作为参数传入change方法
ev-click={_.bind(this.change, this, 'Hi')}
// 其他方式同理
```

### 组件生命周期

#### _init

组件初始化，这个时候dom还没渲染，不能在该方法中进行dom操作，一般在此阶段准备数据。如果是异步准备数据，例如：ajax方式，则需要返回一个promise。

```js
var Widget = VdWidget.extend({
    ...

    _init: function() {
        var self = this;
        // 异步获取数据，返回promise
        return api.getData().then(function(data) {
            self.set('data', data);
        });
    }
});
```

#### _create

组件初始化，这个时候dom已经渲染完成，可以直接操作dom，如：初始化date-picker等第三方组件，绑定第三方非标准事件等。

```js
var Widget = VdWidget.extend({
    ...

    _create: function() {
        var $element = $(this.element),
            self = this;
        $element.find('select.query-name').on('change', function(e) {
            self.set('queryName', $(e.target).find('option:selected').text());
        });
        $element.find('.date-picker').datetimepicker({
            format: 'YYYY-MM-DD',
            locale: 'zh-cn'
        });
    }
});
```

#### _update

每次调用`set`方法都会触发组件更新（`set(data, {silent: true})`除外），每次更新完成后，会调用`_update`方法，我们可以重载该方法去处理一些UI更新问题。
如：`<select></select>`改变后，需要调用`bootstrap-select`的`refresh`方法

```js
var Widget = VdWidget.extend({
    ...

    _update: function() {
        $(this.element).find('select.select-picker').selectpicker('refresh');
    }
});
```

#### _destroy(domNode)

组件销毁时，将调用`_destroy`。该方法将待销毁的`dom`对象作为参数传入。

```js
var Widget = VdWidget.extend({
    ...

    _destroy: function(domNode) {
        $(domNode).find('select.select-picker').off();
    }
});
```

### 事件

类似于`backbone`，所有调用`set`方法，导致数据改变的情况，都会触发相应的change事件`change:name`，另外还会触发一个`change`事件。
`VdWidget`内部绑定了该`change`事件，会使UI自动更新。如果需要阻止更新，调用`set`时，可以传入`{silent: true}`作为最后一个参数。

除了`set`触发的事件，还有一个事件`rendered`，该事件会在组件渲染完成后触发，因为如果`_init`是异步的，则需要在改事件触发后，才能操作dom，进行`mount`。

### 数据

`VdWidget`并没有提供单独的`Model`层，而是将数据和UI绑定在一起，在`VdWidget`既可以操作数据，又可以操作dom。
同`backbone`的数据操作方式，组件所需的默认数据通过`defaults`字段提供，与`backbone`不同的是，该字段可以被继承

1. 获取数据通过`get`
2. 设置数据通过`set`

### 组件继承

要实现组件继承，一般都要分两步

1. 继承组件的方法
2. 扩展vdt模板

如上所示，组件方法的继承通过`extend`静态方法实现。

```js
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
```

上例中，只是继承了`Card`的方法，如果需要扩展`template`，我们需要单独定义模板。模板可以定义成字符串，html的`<script type="text/vdt"></script>`中，或者单独的模板文件。
推荐的做法的是定义成单独的模板文件，在服务器端编译成`amd`方式的js文件，通过`require.js`等工具进行加载。

需要注意的是，要使模板可以扩展，则需要编写可被扩展的模板，也就是需要中模板定义一些可被填充的坑。

> 关于模板的继承可以参见[vdt.js#template-extend](https://github.com/Javey/vdt.js#template-extend)

```html
<script type="text/vdt" id="card_template">
    <div ev-click={_.bind(this.click, this)}>
        {this.get('title')}
        {/* 在这里挖个坑 */}
        <b:body />
    </div>
</script>

<script type="text/vdt" id="tableCard_template">
    // 需要将模板字符串变为函数，才能去填坑
    var card = Vdt.compile($('#card_template').html());
    <t:card>
        <b:body>
            <table>
                <tr>
                    <td>tableCard</td>
                </tr>
            </table>
        </b:body>
    </t:card>
</script>
```

```js
var Card = VdWidget.extend({
    defaults: {
        title: 'card'
    },

    template: $('#card_template').html(),

    click: function() {
        alert('click card');
    }
});

// 继承Card组件
var TableCard = Card.extend({
    template: $('#tableCard_template').html(),

    click: function() {
        alert('click tableCard');
    }
});

VdWidget.mount(TableCard, $('body')[0]);
```

上述方式，是通过在前端定义模板然后前端编译完成的，其存在一个问题：`TableCard`组件每次更新都需要获取`card_template`字符串，然后重新编译。

最好在模板外编译好模板，然后在模板内直接引用。需要注意的是，模板是字符串，模板编译好后的函数定义在全局作用域下，并不能在模板中直接访问非全局的变量/函数。

所以要么将编译后的函数定义成`window`下的对象，要么将模板函数通过绑定到`this`上注入。记住，在模板中只能访问`window`和`this`上的属性和方法。

对于注入`this`的方式，我们这样定义`tableCard_template`

```html
<script type="text/vdt" id="tableCard_template">
    // 这里不需要编card模板了，而是直接调用this.card
    <t:card>
        <b:body>
            <table>
                <tr>
                    <td>tableCard</td>
                </tr>
            </table>
        </b:body>
    </t:card>
</script>
```

```js
// 继承Card组件
var TableCard = Card.extend({
    template: $('#tableCard_template').html(),

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
```

可以看到前端编译模板，比较麻烦，而且有一定的性能损耗。在实际生产中，我们更多的是定义单独的vdt模板文件，然后编译成js，再通过amd工具，如：`require.js`，加载依赖的模板函数。
这样可以使模板自己管理自己的依赖，而不需要在js中进行各种依赖注入。

借助`express`或其他node server工具，可以快速搭建一个后端实时编译vdt的环境

```js
var Express = require('express'),
    Vdt = require('vdt.js');

var app = Express();

app.use(Express.static(__dirname));

// 实时编译vdt
app.use(Vdt.middleware({
    src:__dirname
}));

app.listen(9678);
```

定义模板vdt文件

```jsx
// 文件: /demo/tpl/card.vdt
<div ev-click={_.bind(this.click, this)}>
    {this.get('title')}
    {/* 在这里挖个坑 */}
    <b:body />
</div>
```

```jsx
// 文件: /demo/tpl/tableCard.vdt
// 直接加载所需的依赖
var card = require('/demo/tpl/card.js');
<t:card>
    <b:body>
        <table>
            <tr>
                <td>tableCard which required by require.js</td>
            </tr>
        </table>
    </b:body>
</t:card>
```

定义继承`Card`组件的`TableCard`

```js
// 通过require.js加载自己的模板，模板依赖的模板，通过模板自己去加载
require(['/demo/tpl/tableCard.js'], function(template) {
    // 继承Card组件
    var TableCard = Card.extend({
        // 定义template指向编译好的模板函数，不需要额外注入card模板
        template: template,

        click: function() {
            alert('click tableCard which is required by require.js');
        }
    });

    VdWidget.mount(TableCard, $('body')[0]);
});
```

### 组件组合

组件除了继承外，还可以组合。

组合即在一个组件中调用另一个组件，包括初始化组件和组件之间通信。

和继承一样，模板只能访问`window`和`this`上的属性和方法，所以在模板中调用另一个组件，也要保证该组件可以被访问到。

#### 初始化

__组件名称首字母大写__

对于注入到`this`的方式，如下所示：

```js
// 继承VdWidget，并非Card
var ComponentCard = VdWidget.extend({
    template: '<Card title="component card" />',

    _init: function() {
        // 注入Card组件
        this.Card = Card;
        this._super();
    }
});
```

在模板中调用组件，如下所示：

```jsx
<Card title="component card" />
```

#### 调用组件方法

要调用组件提供的方法，其实只要能够拿到该组件引用就行，我们需要通过`widget`属性给他一个名字，它会挂载到`widgets`对象下。

```jsx
<Card title="component card" widget="card" />
```

这时可以在`VdWidget`中，通过`this.widgets.card`访问`Card`组件提供的方法

```js
var ComponentCard = VdWidget.extend({
    template: '<div><Card title="component card" widget="card" /><div ev-click={_.bind(this.click, this)}>Click Me</div></div>',

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
```

#### 绑定自定义事件

和绑定dom事件一样，通过`ev-*`绑定组件自定义事件

```jsx
<div>
    <Card title="component card" widget="card" ev-change:title={_.bind(this.onChangeTitle, this)} />
    <div ev-click={_.bind(this.click, this)}>Change Title</div>
</div>
```

```js
var ComponentCard = VdWidget.extend({
    template: ...,

    _init: function() {
        // 注入Card组件
        this.Card = Card;
        this._super();
    },

    click: function() {
        // 改变Card组件的title
        this.widgets.card.set('title', 'The title has changed');
    },

    onChangeTitle: function(widget, title) {
        alert('The title has changed to "' + title + '"');
    }
});
```

#### 传入子元素children

组件可以包含子元素，通过`this.get('children')`可以获取子元素

假设Card组件模板如下定义：

```jsx
<div ev-click={_.bind(this.click, this)}>
    {this.get('title')}
    {* 获取子元素 *}
    {this.get('children')}
</div>
```

```jsx
<Card title="children">
    <div>children body</div>
</Card>
```

#### 传入数据

通过属性传入数据，如上所示，传入`title`。如果需要将所有数据传入下一个组件，则通过指定`arguments`属性来实现。

```jsx
// this.get()获取所有数据
<Card arguments={this.get()} />
```


#### 通过amd加载组件

加载组件和加载模板原理一样，组件本身就是js，不想vdt模板需要编译成js。我们可以通过`define`定义组件模块，和加载模板一样，在模板中直接加载组件，而不是通过注入的方式。

## API

### _init()

初始化组件，在模板渲染之前执行，主要用于准备数据和组件/模板注入。此时没有渲染模板，也就没有dom，所以不能进行dom操作

### _create()

初始化组件，在模板渲染之后执行，可以在此进行dom初始化。该方法只会执行一次，组件初始化后的每次更新都不会再执行该函数，但`_init`会执行

### _update()

组件更新完成后执行，可在此做第三方组件的刷新

### _destroy(domNode)

组件销毁，回收资源

* @param `domNode` 组件对应的dom对象

### set(key, value, [options])

设置数据，会触发相应的`change`事件

* @param `key` {String|Object} 若为String类型，则表示需要设置的键名；Object则表示需要设置多个键值对
* @param `value` {*} 若`key`为Object，则该变量表示`options`，否则表示需要设置的值
* @param `options.silent = false` {Boolean} 是否静默更新，即改变数据是否触发UI更新，若为`true`，则数据改变不会导致UI更新，直到下一次非静默更新时一起更新。
* @return `this`

### get([key])

获取数据

* @param `key` {String} 获取相应键名的值，若不传，则返回所有数据
* @return {*}

### on(event, callback)/off(event, callback)/trigger(event, [args]...)

绑定，解绑，触发事件

`callback(widget, newValue)`

### _super([arg]...)/_superApply([args])

调用父级同名方法，两个函数只有传参方式不同，_superApply传入数组作为参数

### element

`{DOM}` 组件对应的dom对象，在`_init()`之后才存在

### widgets

`{Object}` 通过组合方式初始化的组件，挂载到该对象下，可以通过`this.widgets[name]`引用

### vdt

`{Object}` 通过`Vdt.js`处理模板`template`后的对象，参考`Vdt.js`

### rendered

`{Boolean}` 标识该组件是否已被渲染

### extend([prototype])

`Static` 静态方法，继承某个组件

* @param `prototype` {Object} 扩充原型链
* @param `prototype.defaults` {Object} 组件默认数据
* @param `prototype.template` {String|Function} `Vdt`模板字符串或模板函数
* @return 组件子类

### mount(widget, dom)

`Static` 静态方法，挂载某个组件到指定的dom下(appendChild)

* @param `widget` {Object} 可以为VdWidget子类，或者对应的实例化对象
* @param `dom` {DOM} 挂载位置
* @return {Object} 实例化组件对象

## 许可

MIT