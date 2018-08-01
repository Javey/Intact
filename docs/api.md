# Intact.Vdt配置

Intact.Vdt的配置，都是针对模板的，使用`Intact.Vdt.configure()`方法进行配置。

## delimiters

配置Vdt模板动态语法分隔符，默认是一对大括号分割`{}`

* @type `{Array}`
* @default `['{', '}']`
* @example
```js
// 使用两对大括号分割
Intact.Vdt.configure('delimiters', ['{{', '}}']);
```

## autoReturn

Vdt模板默认会返回最后一个标签元素，所以我们在模板的最后必须定义一个标签返回。
如果你像手动返回，可以将该配置设为`false`

* @type `{Boolean}`
* @default `true`
* @example
```js
Intact.Vdt.configure('autoReturn', false);
```

## onlySource

编译模板时，是否只返回模板函数字符串，不去定义正真的函数，默认会定义函数

* @type `{Boolean}`
* @default `false`
* @example
```js
Intact.Vdt.configure('onlySource', true);
```

> 编译模板时，如果定义函数，会使用`new Function()`方法来定义

## noWith

编译模板时，是否使用`with(scope)`语法将模板包起来，这样可以在取值时可以省去`scope`前缀。
默认采用`with`语法，可以将该配置设为`true`来去掉它。

* @type `{Boolean}`
* @default `false`
* @example
```js
Intact.Vdt.configure('noWith', true);
```

## skipWhitespace

是否忽略掉模板定义中，标签之间的空白字符。该配置只会去掉标签间的空白，对于文字之间、文字与
标签之间的空白会保留。

* @type `{Boolean}`
* @default `true` 默认去掉
* @example
```js
Intact.Vdt.configure('skipWhitespace', false);
```

## setModel

当使用`v-model`指令时，当数据变更时，会调用该配置设置的函数去改变数据

* @type `{Function}`
* @default 
```js
function(data, key, value) {
    data.set(key, value);
}
```
* @example
```js
// 例如，我们可以使用v-model指令去改变实例的属性
// 仅仅为了演示，实际应用中，不应该去改变该配置
Intact.Vdt.configure('setModel', function(data, key, value) {
    data[key] = value;
});
```

## getModel

与`setModel`对应，使用`v-model`时，规定获取数据的方法

* @type `{Function}`
* @default
```js
function(data, key) {
    return data.get(key);
}
```
* @example
```js
// 例如，我们可以使用v-model指令获取实例的属性
// 仅仅为了演示，实际应用中，不应该去改变该配置
Intact.Vdt.configure('getModel', function(data, key) {
    return data[key];
});
```

## disableSplitText

当在服务器渲染组件时，存在以下问题：

对于模板
```html
<div>{a}{b}</div>
```
假设`a = 1, b = 2`，则渲染的结果为：

```html
<div>12</div>
```

上述渲染结果返回给浏览器后，浏览器会将`12`作为一个`TextNode`，而这在前端混合时(hydrate)，
造成问题，因为它们应该当做两个`TextNode`处理才对（`1`和`2`）。

所以后端渲染，我们可以是结果加入一些分隔符来区分它们

```html
<div>1<!---->2</div>
```
上述渲染结果，我们在`1`和`2`中间加入注释节点来分割它们，然后前端混合时，当检测到该注释时，
自动忽略，就可以正常混合了。

该配置默认为开启，表示使用注释分割

* @type `{Boolean}`
* @default `false`
* @example
```js
Intact.Vdt.configure('disableSplitText', true);
```

> Intact.Vdt的配置，除了`setModel`和`getModel`是运行时配置外，其他都是编译时配置，所以当你
> 想在浏览器实时编译模板时，它们才有用。如果你使用`vdt-loader`来
> 处理编译，那应该将它们当做`vdt-loader`的参数，而不是直接调用`Intact.Vdt.configure()`来
> 配置。

# Intact类方法

## Intact.extend

继承Intact来创建一个组件，新创建的组件可以继续调用它的`extend()`来创建子组件。

### Intact.extend(property)

* @param proptery `{Object}` 指定组件的原型链属性和方法
* @param `{Intact Class}`
* @example

```js
var App = Intact.extend({
    template: '<div>{self.get("title")}</div>',
    defaults: function() {
        return {title: 'Intact'};
    }
});

Intact.mount(App, document.getElementById('app'));
```
<!-- {.example} -->

<div class="output"><div id="app"></div></div>

## Intact.mount

将一个组件挂载到指定节点下（appendChild）

### Intact.mount(Component, dom)

* @param Component {Intact Class} 要挂载的组件
* @param dom {HtmlElement} 指定要挂载的地方
* @return {Intact} 返回组件的实例
* @example 见上例

## Intact.hydrate

将组件与指定节点的子元素混合，用于服务器端渲染后，前端重新建立绑定关系的情况。

### Intact.hydrate(Component, dom)

* @param Component {Intact Class} 要混合的组件
* @param dom {HtmlElement} 要混合的节点
* @return {Intact} 返回组件的实例
* @example

假设服务器端渲染的结果如下：

<div class="output" id="hydrate">
    <div>Click me <!---->0<!----> times!</div>
</div>

上述元素点击没有事件，我们可以通过混合，给它绑定上事件

```js
var App = Intact.extend({
    template: '<div ev-click={self.set.bind(self, "times", self.get("times") + 1)}>\
        Click me {self.get("times")} times!</div>',
    defaults: function() {
        return {times: 0};
    }
});

Intact.hydrate(App, document.getElementById('hydrate'))
```
<!-- {.example.manual} -->

当你点击“点击运行”按钮执行上述混合操作，上面的元素就会绑定上事件和数据了。

> 混合（hydrate）并不是单纯地用组件渲染的元素替换掉之前的元素，而是复用之前的元素，
> 然后重新建立起绑定关系。

# Intact实例方法

## set

设置实例数据，如果触发变更会是界面更新，并且触发相应的事件。详见[Intact实例#操作数据][1]

### set(key, value[, options])

* @param key `{String}` 属性名
* @param value `{*}` 属性值
* @param options `{Object}` 选项
* @return `this`
* @example
```js
this.set('a', 1);
this.set('b.b', '2');
```

### set(obj[, options])

* @param obj `{Object}` 批量设置的属性对象 
* @param options `{Object}` 选项
* @return `this`
* @param
```js
this.set({a: 1, b: '2'});
```

> 批量设置时，不用使用路径设值，否则会将路径当做属性名来添加新属性。例如：
> `this.set({'b.b': 2})`会添加属性名`b.b`值为`2`，而非属性`b`值为`{b: 2}`。
> 
> @since v2.2.6 支持批量路径设置，例如上例`b`值为`{b: 2}`

## get

获取实例数据

### get(key)

* @param key 要获取的属性名
* @return `{*}`
* @example
```js
this.get('a');
this.get('b.b');
```

### get()

* @return `{*}` 返回实例所有数据

## on

绑定组件的事件，详见[事件处理#监听组件事件][2]

### on(eventName, callback)

* @param eventName `{String}` 事件名
* @param callback `{Function}` 事件处理函数
* @return `this` 
* @example
```js
this.on('$change:a', function(c, newValue, oldValue) {
    console.log(newValue, oldValue);
});
```

## one

绑定组件的事件，与`on()`不同之处在于，事件回调触发后，立即解绑

### one(eventName, callback)

* @param eventName `{String}` 事件名
* @param callback `{Function}` 事件处理函数
* @return `this` 
* @example
```js
this.one('$change:a', function(c, newValue, oldValue) {
    console.log(newValue, oldValue);
});
```

## off

解绑事件

### off()

解绑所有事件

* @return `this`

### off(eventName)

解绑所有`eventName`事件

* @param eventName `{String}` 要解绑的事件名
* @return `this`

### off(eventName, callback)

解绑指定事件名下指定的事件处理函数

* @param eventName `{String}` 要解绑的事件名
* @param callback `{Function}` 要解绑的事件处理函数
* @return `this`
* @example
```js
var callback = function() {};
this.on('$change:a', callback);
this.off('$change:a', callback);
```

## trigger

触发事件

### trigger(eventName[, ...args])

* @param eventName `{String}` 要触发的事件名
* @param args `{*}` 传给事件处理函数的数据
* @return `this`
* example
```js
this.trigger('like', 'Javey', '红楼梦');
```

## toString

将组件渲染成字符串，一般用于服务器端渲染

### toString()

* @return `{String}`
* @example
```js
// 将上面的第一个App渲染成字符串
var app = new App();
console.log(app.toString()); // <div>Intact</div>
```
<!-- {.example} -->

## init

初始化组件的dom元素赋给`element`属性，此时会触发`_create`生命周期

### init()

* @return `{HtmlElement}`

## mount

触发组件`_mount`生命周期

### mount()

* @return `{undefined}`

## update

使组件强制更新界面，触发`_beforeUpdate`和`_update`生命周期

### update()

* @return `{HtmlElement}`

## destroy

销毁组件，触发`_destroy`生命周期

### destroy()

* @return `{undefined}`

## _initMountedQueue

用于组件生命周期中，给组件绑定后才执行的函数，初始化一个队列，详见[Intact实例#创建实例][1]

## _triggerMountedQueue

执行上述队列中的函数

# Intact生命周期

详见[组件生命周期][3]


# Intact实例属性

## defaults

定义组件的默认数据，详见[组件#默认数据defaults][4]

* @type `{Object | Function}`
* @defaults `undefined`
* @example
```js
Intact.extend({
    defaults: function() {
        return {title: 'Intact'};
    }
});
```

## template

定义组件的模板，详见[组件#模板template][4]

* @type `{String | Function}`
* @defaults `undefined`
* @example
```js
Intact.extend({
    template: '<div>Intact</div>'
});
```

## props

保存组件所有数据，通过`get()`方法获取

* @type `{Object}`
* @defaults `{}`
* @example
```js
this.set('a', 1);
this.props.a === this.get('a') // true
```

> `props`数据可以直接获取，但不要直接设置，否则不会更新模板，并且触发相应事件

## uniqueId

组件实例的id，在全局所有实例中唯一

* @type `{String}`

## element

组件渲染后，该属性指向组件的dom元素

* @type `{HtmlElement}`

## isRender

标识组件是否是初次渲染

* @type `{Boolean}`

## vNode

@since v2.2.0

指向组件的vNode

## parentVNode

指向组件的父vNode

* @type `{VNode | undefined | null}`

## parentDom

指向组件的父元素

* @type `{HtmlElement | undefined | null}`

## mountedQueue

组件挂载后执行函数的队列

* @type `{MountedQueue}`

## vdt

组件初始化后，会使用`template`定义的模板创建一个Vdt实例，然后赋给组件的`vdt`属性。关于Vdt实例
下面会详细介绍。

* @type `{Vdt}`

# Intact实例特殊属性

## children

`children`属性用于获取所有传递给组件的子元素。如：

```js
var Component = Intact.extend({
    template: '<div>{self.get("children")}</div>'
});
var App = Intact.extend({
    template: 'var Component = self.Component; ' + 
        '<Component><b>test</b></Component>',
    _init: function() {
        this.Component = Component;
    }
});

App;
```
<!-- {.example.auto} -->

# Intact.Vdt类

## Intact.Vdt

该函数返回一个vdt实例

### Intact.Vdt(source[, options]) 

* @param `source` `{String | Function}` 模板函数或模板字符串
* @param `options` `{Object}` 如果`source`为模板字符串，则该参数可以指定编译器的配置项

有两种方式创建vdt实例：

1. 使用`new`操作符创建实例
2. 直接执行构造函数

* @example
```js
var vdt1 = new Intact.Vdt('<div>Intact</div');
var vdt2 = Intact.Vdt('<div>Intact</div>');
// 如果是模板函数
var vdt3 = Intact.Vdt(function(self, Vdt) {
    return Vdt.miss.h('div', null, 'test');
});
```

## Intact.Vdt.miss

指向底层虚拟DOM引擎，可以调用它的`h()`方法创建元素的虚拟DOM，或者调用`hc()`方法创建注释的虚拟DOM

* @type `{Object}`

## Intact.Vdt.utils

指向Vdt模板引擎提供的工具函数，参见[utils.js][5]

* @type `{Object}`

## Intact.Vdt.compile

编译模板，返回模板函数

### Intact.Vdt.compile(source[, options])

* @param source `{String | Function}` 如果传入字符串，则根据编译配置，编译成相应的模板函数；
  如果传入函数，则直接返回，此时编译配置将被忽略。
* @param options `{Object}` 编译选项，详见上面“Intact.Vdt配置”说明
* @return `{Function}` 模板函数
* @example
```js
Intact.Vdt.compile('<div>{self.get("title")}</div>');
Intact.Vdt.compile('return <div>Intact</div>', {
    // 模板中手动return了，这里设置成不自动return
    autoReturn: false
});
```

## Intact.Vdt.configure

配置Vdt模板引擎，详见上面“Intact.Vdt配置”说明

### Intact.Vdt.configure(key, value)

单个设置

* @param key `{String}`
* @param value `{*}`
* @return `{Object}`

### Intact.Vdt.configure(obj)

批量设置

* @param obj `{Object}`
* @return `{Object}`

### Intact.Vdt.configure(key)

获取指定配置

* @param key `{String}`
* @return `{*}`


# Intact.Vdt实例

## render

传入数据，将模板渲染成DOM元素

### render([data[, parentDom[, queue[, parentVNode]]]])

* @param data `{Object}` 渲染到模板的数据
* @param parentDom `{HtmlElement}` 指定父元素
* @param queue `{MoutedQueue}` 指定挂载函数队列
* @param parentVNode `{VNode}` 指定父虚拟DOM
* @return `{HtmlElement}` 渲染后元素
* @example
```js
var App = Intact.extend({
    template: '<div>{title}</div>'
});
```
<!-- {.example} -->

```js
var app = new App();
var element = app.vdt.render({
    title: 'Intact'
});
document.getElementById('vdt-render').appendChild(element);
```
<!-- {.example.manual} -->

<div class="output" id="vdt-render"></div>

## renderVNode

将vdt实例渲染成虚拟DOM

### renderVNode([data])

* @param data `{Object}`
* @return `{VNode}`
* @example
```js
var app = new App();
var vNode = app.vdt.renderVNode({title: 'Intact'});
// 运行后，打开控制台查看结果
console.log(vNode);
```
<!-- {.example.manual} -->

## renderString

将vdt实例渲染成字符串

### renderString([data])

* @param data `{Object}`
* @return `{String}`
* @example
```js
var app = new App();
var html = app.vdt.renderString({title: 'Javey'});
// 运行后，打开控制台查看结果
console.log(html);
```
<!-- {.example.manual} -->

## update

更新vdt实例对应的DOM，必须调用`render()`方法渲染后，才能更新

### update([data[, parentDom[, queue[, parentVNode]]]])

* @param data `{Object}` 渲染到模板的数据
* @param parentDom `{HtmlElement}` 指定父元素
* @param queue `{MoutedQueue}` 指定挂载函数队列
* @param parentVNode `{VNode}` 指定父虚拟DOM
* @return `{HtmlElement}` 渲染后元素
* @example
```js
var app = new App();
var dom = app.vdt.render({title: 'Intact'});
document.getElementById('vdt-update').appendChild(dom);
```
<!-- {.example} -->

```js
// 更新vdt
app.vdt.update({title: 'Javey'});
```
<!-- {.example.manual} -->

<div class="output" id="vdt-update"></div>

# 指令

## v-if

指定元素是否渲染，参考[模板语法#条件渲染][6]

* @type `{*}`

## v-else-if

条件渲染

* @type `{*}`

## v-else

条件渲染

* @type `不需要属性值`

## v-for

循环渲染元素，参考[模板语法#循环渲染][6]

* @type `{Object | Array}`

## v-for-key

指定循环渲染key对应的形参名

* @type `{String}`
* @defaults `'key'`

## v-for-value

指定循环渲染value对应的形参名

* @type `{String}`
* @defaults `'value'`

## v-model

建立起模板与组件数据的双向绑定，参考[表单处理][7]

## v-raw

使用该指令，可以略过子元素的编译过程，所有子元素都将作为当前节点的文本元素。该指令可以让你
输出动态语法分隔符`{}`，也可用于`<script>`标签等内容输出中。

* @example
```html
<div v-raw>{self.get('title')}</div>
=>
<div>{self.get('title')}</div>
```

## ev-*

绑定原生事件或组件事件，参考[事件处理][8]

# 标签

## <t:template>

继承模板函数名为`template`的模板，继承后可以使用`<b:block>`标签扩展父模板。参考[组件继承][9]

* @param `template` 要继承的父模板函数名
* @example
```html
var layout = Intact.Vdt.compile('<div>\
    <b:content>content</b:content>\
</div>');

var child = Intact.Vdt.compile('<t:layout>\
    <b:content>{parent()} child content</b:content>\
</t:layout>')
```

## <b:block>

使用`<t:template>`标签继承父模板后，使用`<b:block>`标签来扩展父模板的内容，并且可以在该标签里，
使用`parent()`函数引入父模板对应的`block`的内容。如果不扩展父模板对应的`block`，则父模板定义的
内容会完整地继承下来。

> @since v2.2.0 对组件同样有效

* @param `block` 要扩展模板的`block`名称

# 内置组件

## Animate

`Animate`组件为元素提供了动画能力，你可以直接在模板中使用它而无需引入。参考[动画][10]

* @prop `a:tag` `{String}` 指定组件要渲染的标签，默认`'div'`
* @prop `a:transition` `{String}` 指定动画时添加的类名的前缀，默认`'animate'`
* @prop `a:appear` `{Boolean}` 指定是否为初始化渲染添加单独的动画，默认`false`，表示初始化渲染
  时，使用enter动画
* @prop `a:mode` 指定动画渲染的模式，可选项为`out-in | in-out | both`，默认为`both`
* @prop `a:move` 指定是否当元素进入或离开，导致兄弟元素改变位置时，是否使用动画移动位置，默认`true`
* @prop `a:disabled` 指定当前组件是否只做动画管理者，自身不进行动画，默认`false`，表示即做动画管理者，
  自身也进行动画
* @prop `a:delayDestroy` 当为`true`，表示动画完成后才销毁组件，否则先执行`destroy`方法再进行动画，默认为`true`
* @event `a:enterStart` 进入动画开始时触发
* @event `a:enter` 进入动画进行时触发
* @event `a:enterEnd` 进入动画结束时触发
* @event `a:leaveStart` 离开动画开始时触发
* @event `a:leave` 离开动画进行时触发
* @event `a:leaveEnd` 离开动画结束时触发
* @event `a:appearStart` 初次渲染动画开始时触发
* @event `a:appear` 初次渲染动画进行时触发
* @event `a:appearEnd` 初次渲染动画结束时触发
* @example
```html
<div>
    <Animate v-if={self.get('show')}>Show</Animate>
</div>
```

# vNode相关

## Intact.Vdt.miss.h 

创建虚拟DOM，参考[模板template#h函数][11]

## Intact.Vdt.miss.hc

创建注释的虚拟DOM

### Intact.Vdt.miss.hc([comment])

* @param `comment` 注释内容
* @example
```js
var template = function() {
    return Intact.Vdt.miss.hc('test');
};
var vdt = Intact.Vdt(template);
var dom  = vdt.render();
document.getElementById('hc').appendChild(dom);
```
<!-- {.example} -->

<div class="output" id="hc">打开控制台查看注释元素</div>

[1]: #/document/instance
[2]: #/document/event
[3]: #/document/lifecycle
[4]: #/document/component
[5]: https://github.com/Javey/vdt.js/blob/master/src/lib/utils.js
[6]: #/document/syntax
[7]: #/document/form
[8]: #/document/event
[9]: #/document/extend
[10]: #/document/animation
[11]: #/document/template
