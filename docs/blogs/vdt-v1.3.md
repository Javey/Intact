# Vdt v1.3 发布

Intact所基于的模板引擎Vdt发布了v1.3版本，该版本带来了以下新特性，[发布日志](http://javey.github.io/vdt.html#/documents/changelog)

1. add: 对于组件可以双向绑定任意属性，而非仅仅只是`value`属性 [Javey/Intact#7](https://github.com/Javey/Intact/issues/7)
2. add: 更详细的报错信息，可以标示出具体的错误位置 [#9](https://github.com/Javey/vdt.js/issues/9) 
3. add: 支持同一事件绑定多次回调函数，可以在`v-model`占用了事件属性后，再次绑定该事件属性，详见[双向绑定(v-model)](https://javey.github.io/vdt.html#/documents/model) [Javey/Intact#9](https://github.com/Javey/Intact/issues/9) 
4. add: 新增虚拟标签`template`用于包裹多个元素，`template`只会渲染子元素，自身不会被渲染，详见[模板语法 template](https://javey.github.io/vdt.html#/documents/template) [#10](https://github.com/Javey/vdt.js/issues/10)
5. add: 支持带参数的`block`，详见[模板继承 带参数的block](https://javey.github.io/vdt.html#/documents/extend) [#8](https://github.com/Javey/vdt.js/issues/8)
6. add: 模板编译后的代码进行了美化，方便调试

7. change: 现在`skipWhitespace`也会去掉标签和插值分隔符之间的空白字符 [#11](https://github.com/Javey/vdt.js/issues/11)

## 报错信息

之前vdt模板编译出错时，报错信息不够准确，给排查问题造成了很大的困扰。改进后的报错信息，
可以像`babel`那样指定到具体的行和列，并打印出代码片段，例如：

```js
ERROR in ./components/checkbox/index.vdt
Module build failed: Error: Unclosed tag: </span> (19:6)
> 19 |     <span class="k-wrapper">
     |      ^
```

## 双向绑定组件的任意属性

对于组件`Intact`，之前只能通过`v-model`双向绑定`value`属性，现在可以绑定任意属性了，用法如下：

```html
<Pagination v-model="page" v-model:limit="size" />
```

绑定对象的子属性也是可以的

```html
<Component v-model:data.age="age" />
```

## 同一事件绑定多个函数

新版支持同一个事件，绑定多个回调函数，注意不是传入数组，而是书写多次该事件属性，例如：

```html
<div ev-click={callbackA} ev-click={callbackB}>click</div>
```
上例中，当点击`div`时，`callbackA`和`callbackB`会依次执行。

大多数情况下我们无需给同一事件绑定多个事件回调函数，但是由于`v-model`语法糖的存在，它的
编译结果会占用一个事件属性。有了该特性，我们依然可以再次添加同名的事件属性，例如：

```html
<input v-model="data" ev-input={callback} />
```

它等价于(以下并非真实编译结果)

```html
<input value={data} ev-input={(e) => data = e.target.value} ev-input={callback} />
```

此时自定义的`callback`回调函数，也会在`input`事件触发时执行

## template标签

`template`是一个伪元素，它只会渲染子元素，自身不会被渲染成任何内容。这在我们结合`v-for`或`v-if`
等指令，来渲染和判读多个元素时提供了便利。

```html
<dl>
    <template v-for={list}>
        <dt>{value.name}</dt>
        <dd>{value.age}</dd>
    </template>
</dl>
```

```js
{
    "list": [
        {"name": "Javey", "age": 18},
        {"name": "Tom", "age": 20}
    ]
}
```

渲染结果如下：

```html
<dl>
    <dt>Javey</dt>
    <dd>18</dd>
    <dt>Tom</dt>
    <dd>20</dd>
</dl>
```

## 带参数的`block`

`block`可以传递参数，我们可以在父模板中传递参数给子模板，子模板中接受参数后，可以根据不同的数据 
渲染不同的结果。这在`v-for`渲染中很有用，我们可以动态每一次渲染的结果。这类似`vue`中的`slot-scope`，
不同的是：和所有的`block`一样，我们可以通过`parent()`引用父模板中定义的内容。

使用方法如下：

1. 首先我们需要在父模板中给block指定实参，通过args属性指定，该属性值是一个数组
2. 然后在子模板中给block指定形参，通过params属性指定，该属性值是一个字符串

```html
// @file ./list.vdt
<ul>
    <li v-for={data}>
        <b:item args={[value, key]}>{value.name}</b:item>
    </li>
</ul>
```

```html
// @file ./child.vdt
var list = require('./list.vdt');

<t:list data={[
    {name: 'Javey', age: 18},
    {name: 'Tom', age: 20}
]}>
    <b:item params="item, index">
        {index + 1}: {parent()}, {item.age}
    </b:item>
</t:list>
```

渲染结果如下：

```html
<ul>
    <li>1: Javey, 18</li>
    <li>2: Tom, 20</li>
</ul>
```

上例中，父模板的`item` block通过`args`传入`value` `key`当做实参，子模板通过`parmas`定义形参。可以
看到，我们依然可以通过`parent()`访问到父模板中定义的内容
