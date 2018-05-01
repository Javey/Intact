# 介绍

Intact是一个数据驱动构建用户界面的前端框架。设计的初衷
是为了解决现有框架中在构建单页面应用时，必须依靠嵌套
路由来实现复杂的页面结构的问题。__组件继承__ 是该框架
最大的特色，同时强大的组件异步渲染机制，极大地提高了组件的灵活性。

## 嵌套路由的问题

现有框架对于结构相同的页面，都是采用嵌套路由来实现。
这样做的缺点就是：子路由无法获取整个页面的控制权。
当子路由的改变需要父路由控制的界面也要做相应改变时，必须
借助组件间的通信来解决，这会使问题变得复杂。

而Intact通过组件的继承，完全摒弃复杂的路由嵌套，所有
页面的逻辑都由单个组件控制，这样该组件将拥有整个页面
的控制权，自然也就可以决定整个页面各个细节的渲染逻辑。

我们后面会对它做详细介绍。

# 安装

## 通过script标签引入

请通过`npm`、`bower`或者直接到github上下载源码包。其中
[`dist/intact.js`](https://raw.githubusercontent.com/Javey/Intact/master/dist/intact.js)
为UMD方式打包的文件，直接通过script引入会暴露全局变量`Intact`。

```html
<script src="/path/to/intact.js"></script>

<!-- 或者通过cdn -->
<script src="//unpkg.com/intact"></script>
```

## NPM

在大型项目中，一般都会使用webpack构建，通过npm包管理器来管理项目依赖。

```bash
npm install intact --save
```

Intact源码使用es6编写，你也可以通过如下webpack配置，来在打包时使用es6模块

```js
module.exports = {
    // ...
    resolve: {
        mainFields: ['module', 'browser', 'main']
    }
}
```

# 使用

> 为了方便浏览器直接运行，文档中的例子尽量使用es5编写，当然你也可以使用es6语法，
> 如有必要，文档中会标明es6写法的差异

## Hello Intact 

下面通过一个简单的例子，来介绍Intact组件的使用方法。

```js
var App = Intact.extend({
    defaults: function() {
        return {
            name: 'Intact'
        };
    },
    template: '<div>Hello {self.get("name")}!</div>'
});
```
<!-- {.example} -->

一个Intact组件，必须包含`template`属性才能被实例化，
关于template模板语法可以参考[vdt][1]文档。

通过`Intact.mount`方法，可以将该组件挂载到指定元素下。

```js
window.app = Intact.mount(App, document.getElementById('app'));
```
<!-- {.example} -->

<div class="output">
    <div id="app"></div>
</div>

`Intact.mount()`方法会返回挂载组件的实例，为方便大家测试，将它赋给
`window.app`，如果你打开控制台输入
```js
app.set('name', 'World')
```
可以看到界面会做相应更新。

通过上述例子，可以看出一个组件主要包括以下属性：

1. `defaults`：定义组件所需要的默认数据
2. `template`: 定义组件的模板

然后在模板中通过`self.get('name')`获取数据，在组件中通过
`this.set('name', 'value')`改变数据，一旦`set`方法触发了数据
变更，模板就会相应更新。

> 关于模板中为什么是`self.get()`，而不是`this.get()`，是因为
> Intact基于Vdt（虚拟DOM模板引擎）设计，
> 详见 [this & self](http://javey.github.io/vdt.html#/documents/keyword)

## 条件与循环 

> vdt模板语法非常灵活，从jsx语法衍生而来，所以可以直接在模板
> 中书写任意的js代码。但为了方便书写和阅读，vdt提供了一些指令
> 来实现条件和循环渲染

### 条件渲染 `v-if`

使用`v-if`指令可以实现一个元素的删除和添加(并非`display: none`)

```js
var App = Intact.extend({
    defaults: function() {
        return {show: true};
    },
    template: '<div><div v-if={self.get("show")}>展示出来</div></div>'
});
window.appvif = Intact.mount(App, document.getElementById('app_v_if'));
```
<!-- {.example} -->

<div class="output">
    <div id="app_v_if"></div>
</div>

现在打开控制台，输入以下代码，让它消失
```js
appvif.set('show', false);
```

> 组件的`template`必须返回一个元素节点，不能为`undefined`，所以根节点
> 不能删除，这也是上述例子`v-if`所在元素被另一个div包起来的原因

### 循环渲染 `v-for`

v-for指令可以遍历数组和对象。在循环中，被循环的元素以及子元素，
都可以通过`value`和`key`来访问遍历对象每一项的值和键。

```js
var App = Intact.extend({
    defaults: function() {
        return {
            list: ['Javascript', 'PHP', 'Java']
        };
    },
    template: '<ul>' +
        '<li v-for={self.get("list")} class={value}>{value}</li>' +
    '</ul>'
});
window.appvfor = Intact.mount(App, document.getElementById('appvfor'));
```
<!-- {.example} -->

<div class="output"><div id="appvfor"></div></div>

下面我们改变`list`变量，需要注意的是，数组为引用类型，如果你直接操作它，
Intact并不能检测到`list`已经改变，所以这里需要克隆数组再操作。打开控制台，
输入以下代码，更新`list`

```js
// concat方法会返回新数组
appvfor.set('list', appvfor.get('list').concat(['C++']));
```

> 如果调用`push`方法直接操作数组，Intact将检测不到更新，此时可以调用
> `appvfor.update()`方法强制更新界面。

## 处理用户交互 

### 事件绑定 

通过`ev-*`指令可以在模板中绑定事件，它的值为事件处理函数，例如

```js
var App = Intact.extend({
    defaults: function() {
        return {show: true};
    },

    template: '<div>' +
        '<div v-if={self.get("show")}>展示出来</div>' + 
        '<button ev-click={self.toggle}>展示/隐藏内容</button>' +
    '</div>',

    toggle: function() {
        this.set('show', !this.get('show'));
    }
});
Intact.mount(App, document.getElementById('appev'));
```
<!-- {.example} -->

<div class="output"><div id="appev"></div></div>

对于事件回调函数`toggle`，需要通过`bind`方法来指定`this`，
并且还可以通过它来绑定参数，例如：`bind(self, 'test')`。
另外可以看到，给组件添加方法很简单，直接定义即可，并不需要
挂载到某个变量下。

> @since v2.2.0 事件回调函数会自动`bind(self)`，对于无需传递参数的情况，不用再次`bind`

> `ev-*`指令不仅可以绑定原生浏览器事件，对于组件暴露的事件
> 也可以直接绑定

### 表单操作

通过`v-model`指令可以方便地进行表单数据的双向绑定。

```js
var App = Intact.extend({
    template: '<div>' +
        '<input v-model="value" />' +
        '<div>Your input: {self.get("value")}</div>' +
    '</div>'
});
Intact.mount(App, document.getElementById('appvmodel'));
```
<!-- {.example} -->

<div class="output"><div id="appvmodel"></div></div>

## 组件化编程

上面的例子中，我们都是单个组件挂载到指定元素上。
在实际应用中，不可能在一个组件上完成所有的工作，而是，
将界面拆分成各个小组件，通过组件间嵌套组合完成一个复杂的页面。
下面我们将通过一个例子来一起学习如何使用组件化编程。

例如：实现一个`TodoList`，它包含以下元素，一个输入框，然后是展示每一项数据的`TodoItem`

```js
<TodoList>
    <Input />
    <TodoItem />
</TodoList>
```

首先我们来定义`TodoItem`组件

```js
var TodoItem = Intact.extend({
    defaults: function() {
        return {
            todo: ''
        };
    },
    template: '<div>{self.get("todo")}</div>'
});
```

该组件接受一个字符串类型的属性`todo`，然后将它渲染出来。
我们还应该暴露一个删除事件，让`TodoList`来删除相应数据项。
通过组件的`trigger()`方法，组件可以抛出任意事件。

改进后的`TodoItem`组件，我们在点击删除按钮时，抛出`delete`事件

```js
var TodoItem = Intact.extend({
    defaults: function() {
        return {
            todo: ''
        };
    },
    template: '<div>' +
        '{self.get("todo")}' +
        '<button ev-click={self.delete} type="button">X</button>' +
    '</div>',
    
    delete: function() {
        this.trigger('delete');
    }
});
```
<!-- {.example} -->

然后我们定义`TotoList`组件如下

```js
var TodoList = Intact.extend({
    defaults() {
        return {
            list: [
                '吃饭',
                '睡觉',
                '打豆豆'
            ]
        }
    },
    template: '<form>' +
        '<input />' +
        '<TodoItem v-for={self.get("list")} todo={value} />' +
    '</form>'
});
```

我们在模板中访问了`TodoItem`组件，如果`TodoItem`是个全局变量，
则模板中可以直接访问到，但大多数情况下，我们采用模块化编程方式，
所有的组件都应该是局部变量，然后通过模块加载器来加载。这里想要
在模板中访问到`TodoItem`只需要将它挂载到`TodoList`的实例上即可。

> 需要注意的是：在模板中，组件命名，首字母必须大写

另外我们还需绑定表单的`submit`事件，让表单提交时增加一项`TodoItem`。
同时绑定`TodoItem`暴露的`delete`事件，执行相应的删除操作。
前面我们提过，`ev-*`指令不仅可以绑定原生浏览器事件，还可以绑定
组件自定义事件，下面我们来验证一下。

改进后的`TodoList`如下

```js
var TodoList = Intact.extend({
    defaults() {
        // 绑定到this上 
        // 这样在模板中直接通过self.TodoItem即可获取
        this.TodoItem = TodoItem;

        return {
            list: [
                '吃饭',
                '睡觉',
                '打豆豆'
            ]
        }
    },
    template: 'var TodoItem = self.TodoItem;' +
        '<form ev-submit={self.addNewItem}>' +
            '<input v-model="newItem" style="margin-bottom: 10px;" />' +
            '<TodoItem v-for={self.get("list")} todo={value}' + 
                'ev-delete={self.delete.bind(self, key)}' +
            '/>' +
        '</form>',

    addNewItem: function(e) {
        e.preventDefault();
        if (!this.get('newItem')) return;

        var list = this.get('list');
        var newItem = this.get('newItem');
        this.set({
            'list': list.concat([newItem]),
            'newItem': '' // 清空输入
        });
    },

    delete(index) {
        // 由于数组是引用类型，克隆数组再操作
        var list = this.get('list').slice(0);
        list.splice(index, 1);
        this.set('list', list);
    }
});
```
<!-- {.example} -->

```js
Intact.mount(TodoList, document.getElementById('todo'));
```
<!-- {.example} -->

<div class="output"><div id="todo"></div></div>

> 对于初次接触MV*框架的同学来说，这个例子可能稍显复杂，不过没关系
> 后面我们会对上面提到的点做详细说明。

## 组件继承

组件继承是Intact的一大特色，借助于Vdt模板引擎强大的继承机制，可以提供
更灵活的组件复用能力。在了解组件继承之前，可以先了解下[vdt模板继承功能][2]。

我们先来看一个简单的例子。假设存在两个页面，它们结构相同，有相同的头部和尾部，
只是内容区域不同，则我们可以提取如下结构。

```html
<div>
    <header>header</header>
    <div class="content"></div>
    <footer>footer</footer>
</div>
```

于是，我们可以定义一个组件`Layout`来描绘页面的大体结构。

```js
var Layout = Intact.extend({
    template: '<div>' +
        '<header>header {self.get("title")}</header>' +
        '<div class="content">' + 
            // 此处利用vdt模板的block语法，声明一个可填充区域
           '<b:content />' +
        '</div>' +
        '<footer>footer</footer>' +
    '</div>',

    // 定义默认数据
    defaults: function() {
        return {title: 'Layout'};
    }
});
```
<!-- {.example} -->

下面继承Layout来实现A页面组件

```js
var A = Layout.extend({
    template: '<t:parent>' +
        '<b:content>A页面</b:content>' +
    '</t:parent>',
    defaults: function() {
        return {title: 'Page A'};
    }
});
```
<!-- {.example} -->

对于B页面

```js
var B = Layout.extend({
    template: '<t:parent>' +
        '<b:content>B页面</b:content>' +
    '</t:parent>',
    defaults: function() {
        return {title: 'Page B'};
    }
});
```
<!-- {.example} -->

最后我们模拟浏览器路由来分别展示A/B页面

```js
var App = Intact.extend({
    defaults: function() {
        return {Page: A};
    },
    template: 'var Page = self.get("Page");' +
        '<div>' +
            '<Page />' +
            '<button ev-click={self.toggle}>切换页面</button>' +
        '</div>',

    toggle: function() {
        this.set('Page', this.get('Page') === A ? B : A);
    }
});
Intact.mount(App, document.getElementById('extend'));
```
<!-- {.example} -->

<div class="output"><div id="extend"></div></div>

通过上例可以看到，对于A/B两个大致相同的页面，通过继承的方式，将公共方法和公共
页面结构提取成父组件，然后各个页面仅仅实现自己的特有逻辑，可以充分复用代码。
最最重要的是，子组件A/B拥有整个页面的控制权，你完全可以在A/B中随意改变页面
结构，而无需父组件提供相应接口来执行相应方法。

## ES6组件定义方式

使用ES6定义组件，主要有以下两点差别

1. `Intact.extend()`方法对于对象字面量定义的`defaults`，会在组件继承时
    自动将父组件与子组件定义的数据合并，所以如果ES6组件继承时需要合并父组件定义的数据，
    你需要手动合并他们。
2. ES6对于原型链上的属性，需要通过getter的方式定义

例如：

```js
class App extends Intact {
    defaults() {
        // 如果需要，可以手动合并defaults属性
        return Object.assign({}, super.defaults(), {
            name: 'Intact'
        });
    }

    // 通过getter定义template属性
    // 使用修饰器，让模板可以直接在派生组件中通过<t:parent>直接引用
    @Intact.template()
    get template() {
        return '<div>Hello {self.get("name")}!</div>'
    }
    // 或者也可以定义成类的静态属性 @since v2.2.0
    // @Intact.template()
    // static template = '<div>Hello {self.get("name")}!</div>';
}
```

> `static`语法需要`stage-0`支持
> `npm install babel-preset-stage-0 --save-dev`
> 同时修改`.babelrc`，添加`presets: ['stage-0']`

## 进一步了解

看到这里，相信大家对Intact有了大致的了解，但其中还有很多细节我们没有披露。另外例子中
模板`template`的定义也不优雅。在后面的章节中，我们将会详细讲解Intact的各个细节，以及
如何使用webpack + vdt-loader来更好地组织文件。


[1]: http://javey.github.io/vdt.html
[2]: http://javey.github.io/vdt.html#/documents/template
