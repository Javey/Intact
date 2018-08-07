# 什么是组件

生活中，组件的概念无处不在，小到你正在使用的计算机，大到宏伟的建筑，无不都是通过一个个小组件构成。
本质上Intact是一个组件基础类库，它仅仅规范了组件的定义与使用方式，并没有规范代码结构等方面。
对于web开发来说，每一个html标签也可以看做一个组件，为了满足更高级的封装，W3C提出了`Web Components`
的概念，它让我们可以基于简单的html标签，构建更复杂的标签，并且赋予它样式以及逻辑。

所以，组件是结构，样式，逻辑的封装。而关于怎么封装他们，来提高他们的易用性和复用性，正是Intact
要解决的问题。

```
结构 + 样式 + 逻辑 = 组件
```

# 定义组件 

使用`Intact.extend(properties)`方法就可以定义一个组件

* `properties` 定义组件原型链属性和方法

```js
var Component = Intact.extend({ });
```
<!-- {.example} -->

上例中定义的组件，并不能直接使用，因为没有个`template`的组件不能实例化，它更像一个抽象类，
可供其他组件继承。

以继承父组件的方式定义组件：

```js
var SubComponent = Component.extend({
    template: '<div>sub-component</div>'
});
```
<!-- {.example} -->

## 默认数据 `defaults`

组件有个关键属性`defaults`，它用来定义组件的默认数据。在组件实例化时，会和传入组件的属性
进行合并`Object.assign()`赋给组件实例的`props`属性，作为组件的最终数据。

`defaults`支持两种取值类型：`Object & Function`。

### `Object`类型

@deprecated

```js
var Component;
Component = Intact.extend({
    template: '<div>a = {self.get("a")}</div>',
    defaults: {
        a: 1
    }
});
```
<!-- {.example.auto} -->

如果以`Object`类型定义defaults，在组件继承时，会自动合并。

```js
var SubComponent;
SubComponent = Component.extend({
    template: '<div>a = {self.get("a")}<br />b = {self.get("b")}</div>',
    defaults: {
        b: 2
    }
});
```
<!-- {.example.auto} -->

可以看到，`SubComponent`组件并没有定义`a`属性，但是在模板中却取到了`a`，这是因为继承`Component`时，
也继承了它的默认数据。

这种方式在定义组件时非常方便，但如果使用不当，会存在以下问题。

```js
var Component = Intact.extend({
    template: '<div>\
        <button ev-click={self.add}>+1</button>\
        a.a = {self.get("a.a")}\
    </div>',
    defaults: {
        a: {a: 1}
    },
    add: function() {
        this.set('a.a', this.get('a.a') + 1);
    }
});
```
<!-- {.example} -->

```html
var Component = self.Component;

<div>
    <Component />
    <Component />
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.Component = Component;
    }
});
```
<!-- {.example.auto} -->

当我们点击第一个+1按钮增加第一个组件的的`a.a`的值，然后点击第二个+1按钮，发现第二个组件`a.a`的值并没有从1开始增加，
而是从一个组件最后的值开始增加，看起来两个组件的数据共用了。这显然不是我们想要的，保持组件数据的独立性，才是我们的目的。

其实这一切的根源是由于Intact合并数据时，使用的`Object.assign()`，而这只是一个浅拷贝函数，对于深层嵌套的引用类型，
仍然拷贝的是引用。在组件继承时，也存在同样的问题。

所以在你的数据存在引用嵌套时，我们应该使用`Function`定义`defaults`，它每次都会返回一份新数据。

> `Object`定义方式，将被废弃，请使用`Function`的定义方式 

### `Function`类型

使用`Function`定义`defaults`，应该返回一个`Object`。

```js
var Component = Intact.extend({
    template: '<div>\
        <button ev-click={self.add}>+1</button>\
        a.a = {self.get("a.a")}\
    </div>',
    defaults: function() {
        return {
            a: {a: 1}
        };
    },
    add: function() {
        this.set('a.a', this.get('a.a') + 1);
    }
});
```
<!-- {.example} -->

```html
var Component = self.Component;

<div>
    <Component />
    <Component />
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.Component = Component;
    }
});
```
<!-- {.example.auto} -->

此时，每个组件的数据是独立的了。

> 采用`Function`类型定义`defaults`，在组件继承时，并不会自动合并数据，
> 如果有需要你可以显式地调用父类的`defaults()`方法，获取到父类定义的数据，
> 然后再手动合并返回。关于如何在子类调父类方面，下面会说明。

## 数据验证

`@since v2.3.0`

组件会在初始化和更新时验证属性合法性，我们只需要通过组件的静态属性`propTypes`定义数据验证方式即可。
当组件验证失败时，会在打印错误信息，但不会终端程序运行。数据的验证只会在开发环境进行。

```js
var Component = Intact.extend({
    template: `<div>test</div>`,
});

// 定义组件的数据格式
Component.propTypes = {
    boolean: Boolean,
    regexp: RegExp,
    string: String,
    number: Number,
    array: Array,
    function: Function,
    object: Object,
    symbol: Symbol,
    date: Date,
    vnode: Intact.VNode,

    stringOrNumber: [String, Number],

    requiredAny: {
        required: true
    },
    requiredNumber: {
        type: Number,
        required: true,
    },
    requiredNumberOrString: {
        type: [Number, String],
        required: true,
    },

    enum: ['left', 'bottom', 'right', 'top'],
    enumWithObject: ['left', 'bottom', 'right', 'top', Object],

    customValidator: {
        validator: function(value) {
            return ['default', 'primary', 'danger'].indexOf(value) > -1;
        }
    },
};
```

### 类型验证

支持任意原生构造函数作为类型检测

1. String
2. Number
3. Boolean
4. Array
5. Object
6. Function
7. Date
8. RegExp

对于自定义构造函数，使用`instanceof`进行检测，例如`Intact.VNode`用于检测是否时虚拟dom对象`vnode`

```js
Component.propTypes = {
    vnode: Intact.VNode
};
```

### 枚举类型

通过数组可以指定枚举类型的数据，甚至可以和构造函数搭配使用，它们之间时”或“的关系

```js
Component.propTypes = {
    enum: ['left', 'bottom', 'right', 'top'],
    enumWithObject: ['left', 'bottom', 'right', 'top', Object],
}
```

### 自定义验证函数

对于复杂的验证方法我们可以指定`validator`函数进行验证，该函数返回布尔值`true`则验证通过，`false`
则验证失败，或者返回字符串来作为错误提示信息。

```js
Component.propTypes = {
    value: {
        validator: function(value) {
            if (value > 100 || value < 0) {
                return "the value must be between 0 and 100";
            }
            return true;
        }
    }
}
```

> 自定义验证函数`validator`的`this`为`undefined`

### 必填属性

添加`required: true`即可指定该属性为必填项

```js
Component.propTypes = {
    value: {
        type: Number,
        required: true
    }
}
```

## 模板 `template`

另一个组件的重要属性便是`template`，它用来定义组件的模板。它既可以传入模板字符串，
又可以传入模板函数，如果传入模板字符串，会调用`Intact.Vdt.compile()`方法将之编译成模板函数。
模板语法请参考[模板语法][1]章节。

> 模板必须返回一个（仅一个）元素

对于模板函数，你也可以像下面一样手动编译生成。

```js
Intact.extend({
    template: Intact.Vdt.compile('<div>component</div>')
});
```
<!-- {.example.auto} -->

> 将模板字符串写入组件会使组件看起来混乱，不利于维护。
> 借助webpack和[`vdt-loader`][2]我们可以将模板拆分成单独的文件，详见[webpack实践][3]

# 组件使用

有两种方式将组件渲染到页面中：

1. 对于根组件，调用`Intact.mount()`方法，直接将组件挂载到指定的元素下
2. 对于子组件，可以在模板中当做标签引入

我们将上述`SubComponent`当做根组件，挂载到`#app`下

```js
Intact.mount(SubComponent, document.getElementById('app'));
```
<!-- {.example} -->

<div class="output"><div id="app"></div></div>

也可以将上述`SubComponent`当做子组件，以标签形式引入

```html
var SubComponent = self.SubComponent;

<div>
    当做子组件引入
    <SubComponent />
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    _init: function() {
        this.SubComponent = SubComponent;
    }
});

Intact.mount(App, document.getElementById('app1'));
```
<!-- {.example} -->

<div class="output"><div id="app1"></div></div>

> 注意：以标签形式引入组件，组件名首字母必须 __大写__

# 组件通信

## 父组件向子组件通信

子组件并不能获取父组件实例，当父组件向子组件通信时，应该使用属性来传递数据。

```js
var SubComponent = Intact.extend({
    template: '<div>{self.get("data")}</div>'
});
```
<!-- {.example} -->

```html
var SubComponent = self.SubComponent;
<SubComponent data="hello" />
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.SubComponent = SubComponent;
    }
});
```
<!-- {.example.auto} -->

## 动态prop

除了传递字面量数据，你还可以通过`{}`语法传递动态数据

```html
var SubComponent = self.SubComponent;

<div>
    <input v-model="message" />
    <SubComponent data={self.get('message')} />
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: function() {
        return {message: 'hello'};
    },
    _init: function() {
        this.SubComponent = SubComponent;
    }
});
```
<!-- {.example.auto} -->

## 子组件向父组件通信

子组件向父组件通信，则是通过事件来传递数据。

> 以下例子仅仅为了演示如何通过自定义事件向父组件通信。大部分实际应用，
> 无需手动触发事件，使用默认事件即可达到目的。

```js
var SubComponent = Intact.extend({
    template: '<input \
        ev-input={self.changeValue} \
        value={self.get("value")}\
    />',
    changeValue: function(e) {
        var value = e.target.value;
        this.set('value', value); 
        // 手动触发事件，传入数据value
        this.trigger('change', value);
    }
});
```
<!-- {.example} -->

```html
var SubComponent = self.SubComponent;

<div>
    <SubComponent ev-change={self.set.bind(self, 'message')} />
    接收到子组件的数据：{self.get('message')}
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.SubComponent = SubComponent;
    }
});
```
<!-- {.example.auto} -->

> Intact组件的属性和事件是属于组件实例的，你不能将组件当做元素DOM使用，
> 例如：如果组件没有暴露`click`事件，你给它绑定`click`事件是无效的。
> ```html
> // 以下click事件和class属性都无效，因为SubComponent并没有处理它们
> <SubComponent ev-click={function() {}} class="test" />
> ```

## 非父子组件通信

当两个非父子组件要进行通信时，需要借助它们共同的父组件来代理通信。

我们将上面定义的`SubComponent`下面定义的`Component`当做兄弟节点渲染，当它们需要通信时，
可以如下这么做：

```js
var Component = Intact.extend({
    template: '<div>来自SubComponent的数据：{self.get("data")}</div>' 
});
```
<!-- {.example} -->

```html
var SubComponent = self.SubComponent;
var Component = self.Component;

<div>
    <SubComponent ev-change={self.set.bind(self, 'message')} />
    <Component data={self.get('message')} />
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.SubComponent = SubComponent;
        this.Component = Component;
    }
});
```
<!-- {.example.auto} -->

# children属性

上面定义的组件都是自闭合的组件，有时候我们想给组件填充其它元素，就像
`<select>`标签填充`<option>`一样，应该怎么做呢？

事实上，所有组件标签内部的元素都会被当做组件的`children`属性，所以我们
可以在组件模板中，通过`self.get('children')`获取它。

例如我们可以实现一个支持label的Checkbox组件：

```html
<label>
    <input type='checkbox'>{self.get('children')}
</label>
```
<!-- {.example} -->

```js
var Checkbox = Intact.extend({
    template: template
});
```
<!-- {.example} -->

```html
var Checkbox = self.Checkbox;

// Checkbox标签中的内容会当做children属性传给Checkbox组件实例
<Checkbox>请勾选</Checkbox>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.Checkbox = Checkbox;
    }
});
```
<!-- {.example.auto} -->

> 这个Checkbox并不完整，仅仅为了演示`children`属性

# 异步组件

异步组件是指：组件所需数据是异步加载的。它的渲染策略如下：

* 如果一个异步组件初次渲染，当数据没有加载完成时，会返回一个注释节点作为占位符，
  待数据加载完毕后，替换成最终的元素
* 如果用一个异步组件去更新之前的元素，当数据没有加载完成时，会保留当前元素不变，
  待数据加载完毕后，替换成最终的元素

异步组件在当你的组件逻辑依赖异步加载的数据时非常有用，因为数据没加载完成，组件
不会渲染，能避免处理数据时，由于数据未定义造成报错。

定义一个异步组件很简单，只需要在组件的`_init()`周期函数中返回`Promise`对象即可。

```js
var AsyncComponent = Intact.extend({
    template: '<div>当前数据为：{self.get("data")}</div>',
    _init: function() {
        // 模拟接口请求，返回Promise
        var self = this;
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                self.set('data', 'Intact');
                resolve();
            }, 1000);
        });
    }
});
```
<!-- {.example} -->

```html
var AsyncComponent = self.AsyncComponent;

<div>
    <AsyncComponent v-if={self.get('show')} />
    <button ev-click={self.set.bind(self, 'show', !self.get('show'))}>
    {self.get('show') ? '销毁' : '渲染'}异步组件
    </button>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.AsyncComponent = AsyncComponent;
    }
});
```
<!-- {.example.auto} -->

可以看到，当渲染组件时，并不会立即渲染，而是等待1s后才渲染。Intact内部会很好地管理
异步组件，所以即使你连续多次点击，它也会被正确地创建和销毁。

> 将一个异步组件改为同步组件只需一步：去掉`_init()`中关键词`return`即可。

# 实例组件

定义组件就是定义类，你可以手动调用`new`实例化该类。[Intact实例][3]章节中，我们提到了怎么实例化，并且渲染它。
但它是作为根组件挂载到页面中的。其实我们也可以将实例当做普通数据，就像插值一样在模板中直接渲染。这就是Intact
支持的实例组件。

实例组件提供了直接操作组件的能力，你可以设置和获取组件渲染的各个细节。

```js
var Component = Intact.extend({
    template: '<div>{self.get("data")}</div>'
});

Intact.extend({
    template: '<div>{self.get("view")}</div>',
    defaults: function() {
        return {
            // 直接实例化组件
            view: new Component({data: 'hello'})
        }
    }
});
```
<!-- {.example.auto} -->


另一个常见的例子是SPA应用中，使用前端路由切换页面。我们可能需要等到异步组件数据加载完毕才开始切换页面，并且在数据
加载的过程中，需要展示loading动画。我们可以如下这么做：

```js
var PageA = Intact.extend({
    template: '<div>PageA, router: {self.get("router")}</div>',
    _init: function() {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, 1000);
        });
    }
});
```
<!-- {.example} -->

```js
var PageB = Intact.extend({
    template: '<div>PageB, router: {self.get("router")}</div>',
    _init: function() {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, 1000);
        });
    }
});
```
<!-- {.example} -->

上述两个组件都模拟1s来加载数据，下面我们定义一个根组件来管理它们。

```html
<div>
    {self.get('view')}
    <div v-if={self.get('loading')}>Loading...</div>
    <button ev-click={self.toggle}>加载组件</button>
</div>
```
<!-- {.example} -->

```js
// 模拟hash路由
var router = {
    '/a': PageA,
    '/b': PageB
};
var hash;
Intact.extend({
    template: template,

    toggle: function() {
        this.set('loading', true);
        hash = hash === '/a' ? '/b' : '/a';
        var Page = router[hash];
        // 实例化组件
        var page = new Page({router: hash});
        this.set('view', page);
        // 判断实例是否数据加载完成
        if (page.inited) {
            // 如果加载完成
            this.set('loading', false);
        } else {
            // 否则等实例加载完成后才挂载
            page.one('$inited', function() {
                this.set('loading', false);
            }.bind(this));
        }
    }
});
```
<!-- {.example.auto} -->

实例组件让你可以控制组件的实例化，这在前端路由中很实用。例如：`/user/1`和`/user/2`两个页面都对应同一个组件，只是
参数不同，这样你可以为每个页面实例化一个组件传入不同的用户ID。如果不采用实例组件，你可能需要为每个组件指定一个唯一
的`key`，否则因为是同一个组件，两个页面不是替换关系，而是更新，这样上一个页面的数据就会带到下一页了。当然你也可以
监听用户ID的变化，只是这样处理起来不如实例组件来的简单。


[1]: #/document/syntax
[2]: https://github.com/Javey/vdt-loader
[3]: #/document/project
