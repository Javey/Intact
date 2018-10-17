> 关于文档中例子的运行情况说明：
> 1. 前面示例中定义的变量，在后面的示例中可以直接获取
> 2. 示例中定义的模板会被自动编译成模板函数，并且赋给`template`变量，所以后面的实例
>    可以直接获取
> 3. 示例中没有手动挂载的根组件，将自动挂载到示例下面，所以你会看到有些地方没有调用
>    `Intact.mount()`组件也挂载了

Intact基于Vdt模板引擎设计，有关模板语法的使用说明，可以参见[Vdt文档][1]。
为了保持阅读连贯性，这里也会介绍一些常见的模板语法。

> Vdt是一个基于虚拟DOM的模板引擎，在JSX语法的基础上，新增了一些指令来实现
> 条件判断、循环、继承等功能。得益于JSX的灵活性，你可以让模板做更多的事情。
> 所以它并非一个纯做表现的模板引擎，你可以将表现逻辑写入模板中。设计的原则是：
> 业务逻辑写入组件，表现逻辑写入模板。这样可以解决组件逻辑过分膨胀的问题。
> 当然业务和表现逻辑的划分，并没有标准，过多的逻辑放入模板，会是模板难以维护，
> 还需读者仔细斟酌。

组件的`template`属性，不仅可以接收一个模板字符串，还可以接收一个模板函数。
这个模板函数，既可以是由模板字符串编译出来的函数，也可以是自定义的函数，
如果是自定义函数，必须返回一个虚拟DOM。关于模板编译成模板函数，以及如何
自定义模板函数的问题，详见[模板template][3]。

# 模板语法分隔符

模板中动态语法都是使用一对大括号`{}`包起来，你也可以使用如下方法，配置这个分隔符。
在分隔符里面，任何合法的JS表达式，都是语法上合法的。但也可能运行时非法，例如：
你不能在html中输出一个对象，除非你序列化它。

```js
// 使用{{  }}做分割
Intact.Vdt.configure({
    delimiters: ['{{', '}}']
});
```

# 插值

## 文本

我们可以在模板中输出`String`或`Number`类型的数据。

```html
<div>Hello {self.get('name')}!</div>
```

上述例子会建立DOM元素到组件`name`属性的绑定，只要组件`name`属性变更触发了`update`，
DOM就会更新。

## 纯HTML

模板输出的数据，都会做转义来防止XSS漏洞。如果你想输出非转义html代码片段，可以将数据
赋给`innerHTML`属性

```html
<div innerHTML={self.get('content')}></div>
```

## 属性

使用`{}`语法，可以动态绑定属性值，例如：

```html
<div id={self.get('id')}></div>
// 对于取值为布尔类型的属性，会将值强制转为布尔类型
<input type="checkbox" checked={self.get('checked')} />
```

### class属性

class属性既可以使用字符串赋值，也可以使用对象赋值。使用对象时，所有值为`true`的键名
都会被当做class属性的值。

```html
<div class="a"></div>
<div class={{a: 1, b: false, c: true}}></div> // <div class="a c"></div>
```

### style属性

style属性可以既支持字符串，又可以支持对象赋值。用对象赋值时，需要使用属性名的驼峰命名方式。

```html
<div style="color: red; font-size: 14px;"></div>
<div style={{color: 'red', fontSize: '14px'}}></div>
```

### ref属性

ref属性提供了保存组件或元素引用的能力，它的取值可以是函数或者字符串。
1. 如果是函数，组件或元素被挂载后，该函数会被执行。对于组件，会传入组件的实例作为参数；对于DOM元素，
会传入DOM作为参数。在组件或元素被销毁时，该函数会被再次调用，传入`null`作为参数；
2. 如果是字符串，则实例或者元素会绑定到`this.refs[refName]`下面。

> 因为`ref`是在编译时判断字符串还是函数的，所以字符串必须是字符串字面量，即:`ref="name"`，如果写成表达式`ref={"name"}`则会报错

```html
<div>
    // 将dom赋给组件的dom属性
    <div ref={function(dom) { self.dom = dom; }}></div>
    // 将实例赋给组件的instance属性
    <Component ref={function(i) { self.component = i; }}></Component>
    <Component ref="test"></Component>
</div>
```

对于循环渲染的时候（下面会讲如何循环渲染），我们可以使用对象保存引用

```html
var Component = self.Component;
<div>
    <Component 
        v-for={self.get('list')}
        ref={function(i) { 
            // 使用v-for循环的key作为键名
            self.components[key] = i;
        }}
        name={value}
        ev-delete={self.delete.bind(self, key)}
    ></Component>
</div>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: '<div>{self.get("name")}' +
        '<button ev-click={function() {self.trigger("delete")}}>X</button>' +
    '</div>'
});
var App = Intact.extend({
    template: template,
    defaults: function() {
        return {
            list: ['JavaScript', 'PHP', 'Java']
        };
    },
    _init: function() {
        this.Component = Component;
        this.components = {};
    },
    delete: function(index) {
        // 不要直接操作元数据
        var list = this.get('list').slice(0);
        list.splice(index, 1);
        this.set('list', list);

        // 如果直接操作原数据，组件不会自动更新，需要手动更新
        // this.get('list').splice(index, 1);
        // this.update();
    }
});

window.appRef = Intact.mount(App, document.getElementById('ref'));
```
<!-- {.example} -->

<div class="output"><div id="ref"></div></div>

打开浏览器输入`appRef.compoents`可以看到引用对象，当你删除一个组件后，再次输入
`appRef.compoents`可以看到相应的引用也被置为`null`。

> 删除组件或元素时，只是将引用置为`null`，你也可以判断参数是否存在，采用`delete`
> 操作来删除键名。

### key属性

key属性用于给元素提供一个唯一的标识，在兄弟元素改变时，能够快速确定元素的增删改和移动。
在渲染列表时，虽然没有强制需要提供`key`属性，但为列表提供`key`属性是个良好的习惯。
在某些情况下，可能必须提供`key`属性才能达到目的。例如进行表单操作时：

```html
<div>
    <input v-if={self.get('step') === 1} name="name"/>
    <input v-else name="email" />
    <button ev-click={self.toggle.bind(self)}>切换input</button>
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        return {step: 1}
    },
    toggle: function() {
        this.set('step', this.get('step') === 1 ? '2' : 1);
    }
});

Intact.mount(App, document.getElementById('appkey'));
```
<!-- {.example} -->

<div class="output"><div id="appkey"></div></div>

可以看到，当我们往input中输入一些内容后，点击“切换input”，内容并不会删除，
这是因为底层比较两个元素时，发现是同一类元素，只是改变了元素的`name`属性，
`value`属性都不存在，所以没有差异，也就不会改变。这种情况也许不是我们想要的。
此时给input设置`key`，则可以解决问题，因为`key`不同，会删除input后重建一个
新input。

```html
<div>
    <input key="name" v-if={self.get('step') === 1} name="name"/>
    <input key="email" v-else name="email" />
    <button ev-click={self.toggle.bind(self)}>切换input</button>
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        return {step: 1}
    },
    toggle: function() {
        this.set('step', this.get('step') === 1 ? '2' : 1);
    }
});

Intact.mount(App, document.getElementById('appkeyed'));
```
<!-- {.example} -->

<div class="output"><div id="appkeyed"></div></div>


## 使用JavaScript表达式

前面提到过`{}`中可以书写任意合法的JS表达式。下面我们给出几个例子说明下

> JS表达式就是可以作为右值的式子，简单地说：能够赋给另一个变量的式子

```html
<div>{self.get('i') + 1}</div>
<div>{self.get('checked') ? 'checked' : 'unChecked'}</div>
<div>{self.get('message').split('').reverse().join()}</div>
<div class={self.get('className') + ' test'}></div>

// 对于复杂的逻辑，我们还可以使用自执行函数
<div>{(function() {
    var ret = [];
    var books = self.get('books');
    for (var i = 0; i < books.length; i++) {
        if (books[i].size < 100) {
            ret.push(books[i].name);
        }
    }

    // 最后返回字符串
    return ret.join(' ');
})()}</div>
```

> Vdt模板支持访问全局变量。这会使你在项目全局引入了`lodash`等工具函数库时，
> 可以直接在模板中方便地使用它们而无需注入模板。但灵活性是把双刃剑，
> 如果你在模板中过多地依赖全局变量，可能会影响到组件的复用性。

# 指令

Vdt模板引擎，提供了一些特殊指令完成特定的工作，其实他们都是语法糖而已，
如果有必要，你完全可以使用纯JS代替他们

## 条件渲染

条件渲染涉及三个指令：`v-if & v-else-if & v-else`。顾名思义，他们控制什么
条件下渲染当前元素。

```html
<div v-if={self.get('num') > 0}>正数</div>
<div v-else-if={self.get('num') < 0}>负数</div>
<div v-else>0，既不是正数，也不是负数</div>
```

> `v-else-if & v-else`必须跟在`v-if`元素后面（空白字符除外），否则会引起编译报错。

## 循环渲染

循环渲染涉及三个指令：`v-for & v-for-key & v-for-name`。
* `v-for` 指定要遍历的数据，可以为数组或对象
* `v-for-key` 为遍历的键名指定形参名，对于数组则为索引，默认为`key`
* `v-for-value` 为遍历的值指定形参名，默认为`value`

```html
<ul>
    <li v-for={self.get('books')} v-for-key="name">
        {name}: ￥{value}元
    </li>
</ul>
```

对于键值的形参，并非只有子元素才能获取，被循环的元素就可以获取它们了。

```html
<ul>
    <li v-for={self.get('books')} data-name={key}>
        {key}: ￥{value}元
    </li>
</ul>
```

## `v-if`与`v-for`一起使用

当`v-if`与`v-for`一起使用时，`v-for`具有更高优先级，此时`v-if`用来控制单次
循环是否展示。并且你可以在`v-if`中，使用`v-for`提供的形参`key & value`
来进行条件判断。

# 模板继承

Vdt提供了模板继承功能，能够让我们定义可被复用的模板。该功能涉及以下标签语法：
* `<t:template>` 子模板声明要继承的父模板`template`，`template`为模板函数
* `<b:block>` 子模板声明要填充到父模板的定义的内容区域`block`

例如：我们定义父模板

```html
<div>
    <b:header>父模板头部</b:header>
    <div>
        <b:content>父模板内容</b:content>
    </div>
</div>
```

然后我们继承父模板，假设父模板被编译后的函数名为`layout`。关于模板编译和引入可以
参考[Vdt模板语法][2]

```html
<t:layout>
    <b:header>子模板头部</b:header>
    <b:content>
        {parent()}
        子模板内容
    </b:content>
</t:layout>
```

在子模板中`<b:content>`中，我们可以调用`parent()`拿到父模板定义的内容。

使用`<t:template>`继承父模板时，我们可以传递数据给父模板，在父模板中，可以通过`scope`
对象获取子模板传递过来的数据。

```html
// 父模板，假设编译后模板函数命名为layout
<div class={scope.className}></div>

// 子模板
<t:layout class="test"></t:layout>
```

> Vdt模板引擎会将`class`属性编译成`className`，所以在父模板中需要取`scope.className`。
> 另外`for`也会编译成`htmlFor`


[1]: http://javey.github.io/vdt.html
[2]: http://javey.github.io/vdt.html#/documents/template
[3]: #/document/template
