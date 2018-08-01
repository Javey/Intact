Intact组件的一个重要的属性是`template`，它本质上是个模板函数，只是当你传入模板字符串时，Vdt会
将它编译成模板函数。在了解`template`属性的更多细节之前，我们先来看看编译后的模板函数是什么样
子。

```html
var title = 'Title';
<div>
    <h1>{title}</h1>
    <p v-if={self.get('show')}>show</p>
    <p v-else>hide</p>
</div>
```
<!-- {.example} -->

我们调用`Intact.Vdt.compile(source[, options])`手动编译它。

<script>
    var source = template.source;
    source = highlight.highlight('js', source, true)
    source = highlight.fixMarkup(source.value);
    console.log(source);
    var pre = document.createElement('pre');
    var code = document.createElement('code');
    code.className = 'hljs';
    code.innerHTML = source;
    pre.appendChild(code);
    $script[0].parentNode.insertBefore(pre, $script[0]);
</script>

可以看到，编译出来的模板函数，有以下细节：

1. 3个参数，`obj`表示传入模板的数据，`_Vdt`是Vdt对象，等于`Intact.Vdt`，`blocks`为子模板定
   义的`<b:block>`，用于模板继承。
2. 函数开头定义了许多帮助函数，其中最重要的是`h`函数，它用于创建虚拟DOM
3. 函数定义`self & scope`变量，函数的`this`指向Vdt实例，大部分情况下`self === scope`，都
   指向传入模板的数据，但当模板用于继承时，他们是不相等的，此时`this`依然指向组件实例，而
   `scope`指向继承时传入父模板的数据。
4. 最后返回一个由`h`函数创建出来的虚拟DOM

> `Intact.Vdt.compile()`编译出来的函数，默认使用`with`语法，你可传入`options = {noWith: true}`
> 来去掉它。

# `h`函数

`h(tag[, props, children, className, key, ref])`函数的作用是创建虚拟DOM，它的参数说明如下：

* `tag` `{String | Function}` 虚拟DOM的类型，可以是字符串定义的html标签，也可是是组件的构造
  函数
* `props` `{Object}` 虚拟dom的属性
* `children` `{String | Number | vNode | Array<String | Number | vNode>}` 定义虚拟DOM的子元素
* `className` 定义DOM的`class`属性，因为使用频率非常高，单独拿出来处理，提高效率
* `key` 虚拟DOM的`key`属性，用于区分每一个子元素
* `ref` 虚拟DOM的`ref`属性，用于引用元素或组件实例

> 对于组件，`children`和`className`将作为`props`属性的一部分，而对于html元素，它们会在编译时
> 单独处理。

例如：

```html
h('div', null, 'test', 'content')
=>
<div class="content">test</div>

h('div', {id: 'test'}, [100, h('span')])
=>
<div id="test">100<span></span><div>

// 假设Component组件的template为 <div>{self.get('chilren')}</div>
h(Component, {children: h('span')})
=>
<div><span></span></div>
```

# 模板编程

知道了以上细节，加之Vdt模板本来就支持JS语法，使得我们可以在定义模板时，采用编程的方式更灵活
地定义模板。

例如：有一个组件`Button`，它既可以返回`button`标签，又可以返回`a`标签，我们可以如下这么做：

```html
// 根据组件的tag属性，返回不同的标签
// 由于Vdt模板默认返回最后一个标签元素，所以我们必须
// 在模板最后定义一个标签，这里采用宏函数来定义标签
var Button = function(attr) {
    // attr === self.get() 返回的是组件的全部属性，我们将不需要
    // 作为html元素的tag和children去掉
    var props = {};
    for (var key in attr.props) {
        if (key !== 'tag' && key !== 'children') {
            props[key] = attr.props[key];
        }
    }
    return h(attr.props.tag, props, attr.props.children);
};

<Button props={self.get()} />
```
<!-- {.example} -->

```js
var Button = Intact.extend({
    template: template,
    defaults: function() {
        return {tag: 'button'}
    }
});
```
<!-- {.example} -->

```html
var Button = self.Button;
<div>
    <Button>button标签</Button>
    <Button tag="a">a标签</Button>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.Button = Button;
    }
});
```
<!-- {.example.auto} -->

# 模板函数编程

上面的例子都是通过定义模板然后编译成模板函数，其实知道了模板函数的原理后，我们也可以直接定义
模板函数，而不需要经过编译处理。由于不需要编译，所以你没必要遵循模板最后必须定义一个标签的约
束，而只需要返回是个合法的虚拟DOM就行。

> Intact内部`Animate`组件，就是直接定义的模板函数。

例如：

```js
Intact.extend({
    template: function(self, Vdt) {
        var h = Vdt.miss.h; 

        // 我们根据button是否传入了href属性来决定是否使用a标签
        if (self.get('href')) {
            return h('a', self.get(), self.get('children'));
        } else {
            return h('button', self.get(), self.get('children'));
        }
    },

    defaults: function() {
        return {
            href: 'javascript:;',
            children: 'hello'
        }
    }
});
```
<!-- {.example.auto} -->

# 模板传递

模板片段可以像普通对象一样赋值并且传递。当一个组件结构支持完全自定义时，我们可能需要为组件的每一处
自定义模板，利用模板传递，这很容易做到。

例如，在菜单组件中，我们点击菜单触发器，就会弹出菜单，假设菜单触发器和菜单都可以自定义模板，我们
可以如下这么做：

```html
<div>
    <div ev-click={self.toggle.bind(self)}>
        {self.get('triggerTemplate')}
    </div>
    <div v-if={self.get('show')}>
        {self.get('menuTemplate')}
    </div>
</div>
```
<!-- {.example} -->

```js
var Menu = Intact.extend({
    template: template,
    defaults: function() {
        return {
            show: false,
            triggerTemplate: null,
            menuTemplate: null
        };
    },
    toggle: function() {
        this.set('show', !this.get('show'));
    }
});
```
<!-- {.example} -->

然后我们在使用`Menu`组件时，自定义`triggerTemplate`和`menuTemplate`的内容

```html
var Menu = Menu;

<Menu 
    triggerTemplate={<button>{self.get('title')}</button>}
    menuTemplate={<ul>
        <li v-for={self.get('list')}>
            {value}
        </li>
    </ul>}
/>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: function() {
        this.Menu = Menu;
        return {
            title: '书籍（点击展开/收起）',
            list: ['Javascript编程', '时间简史', '红楼梦']
        };
    }
});
```
<!-- {.example.auto} -->
