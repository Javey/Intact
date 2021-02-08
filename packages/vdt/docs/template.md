Vdt中默认使用一对大括号`{}`作为分隔符，在`{}`中书写合法的js表达式，但这个表达式必须满足以下条件：

* 作为输出时：表达式的值必须是，`Number`, `String`, `null`, `undefined`或模板引用中的一种，或者是由上述类型组成的数组
* 作为属性值时：表达式可以为任意类型，具体取决于属性取值的类型

__为了提高编译速度，Vdt不会分析`{}`中js表达式的合法性，也不会检测变量是否未定义__

以下写法不合法

```html
<div>{ {a: 1, b: 2} }</div>                       // 不合法，Object不能渲染

<div>{ if (true) { 'a' } else { 'b' } }<div>      // 不合法，if语句不是表达式，可以使用三元操作符
```

## 变量

输出一个变量

```html
<div>{name}</div>
<div>{data.name}</div>
<div>{data['name']}</div>
```

## 函数调用

你可以在`{}`中直接调用函数。Vdt中没有过滤器的概念，但可以调用函数来达到类似的目的

```html
<div>{foo(name)}</div>
<div>{arr.join(',')}</div>
```

## if & else & else if 

用于逻辑控制的3条指令是`v-if & v-else-if & v-else`，本质上它们是三元操作符的语法糖，你也直接使用三元操作符

```html
<div v-if={a === 1}>一</div>
<div v-else-if={a === 2}>二</div>

<div v-else>这个数字好诡异</div>
```

或者使用三元操作符

```html
{a === 1 ? <div>一</div> : a === 2 ? <div>二</div> : <div>这个数字好诡异</div>}
```

`v-if & v-else-if & v-else`必须连起来写，中间不能穿插非空节点，否则会失效

## 循环

`v-for`指令用于实现循环，你也可以使用`[].map`来实现，但该指令支持遍历对象

* <!-- {.example-template} -->
    ```html
    <ul>
        <li v-for={items}>{key}: {value}</li>
    </ul>
    ```
* <!-- {.example-js} -->
    ```json
    {
        "items" : {
            "width": "100px",
            "height": "100px"
        }
    }
    ```
<!-- {ul:.example.dom} -->

* `key`指向对象的键，如果是数组则指向数组的索引
* `value`指向对象或数组的值

### 更改键值命名

通过`v-for-key & v-for-value`指令，可以改变键值的命名

* <!-- {.example-template} -->
    ```html
    <ul>
        <li v-for={items} v-for-key="attrName" v-for-value="attrValue">
            {attrName}: {attrValue}
        </li>
    </ul>
    ```
* <!-- {.example-js} -->
    ```json
    {
        "items" : {
            "width": "100px",
            "height": "100px"
        }
    }
    ```
<!-- {ul:.example.dom} -->

### v-for & v-if 结合使用

`v-for`指令和`v-if`一起使用时，用于控制单条数据是否展示，并非控制整体`v-for`是否展示；

`v-if`中能够使用`v-for`提供的两个变量`key & value`，并且与这两条指令的书写顺序无关

* <!-- {.example-template} -->
    ```html
    <ul>
        <li v-for={items} v-if={key === 'width'}>
            只展示key === 'width'的属性
            {key}: {value}
        </li>
    </ul>
    ```
* <!-- {.example-js} -->
    ```json
    {
        "items" : {
            "width": "100px",
            "height": "100px"
        }
    }
    ```
<!-- {ul:.example.dom} -->

## v-raw

`v-raw`指令可以让你指定某个标签下所有子元素不进行编译，而是输出它的原始内容。这可以使
我们很方便地输出分解符`{}`。例如：

* <!-- {.example-template} -->
    ```html
    <script type="text/md" v-raw>
        var vdt = Vdt(template);
        vdt.render({
            test: 1
        });
    </script>
    ```
<!-- {ul:.example} -->

## 宏函数

宏使你能够定义一块可复用的模板片段，Vdt中没有宏的概念，但可以通过函数实现该功能

* <!-- {.example-template} -->
    ```jsx
    var FormItem = function(attrs) {
        return <div class="form-item">
            <label>
                <span v-if={attrs.required}>*</span>{attrs.label}:
                {attrs.children}
            </label>
        </div>
    };

    <form>
        <FormItem required={true} label="姓名">
            <input type="text" name="name" />
        </FormItem>
        <FormItem required={true} label="密码">
            <input type="password" name="password" />
        </FormItem>
    </form>
    ```
<!-- {ul:.example.dom} -->

* 宏函数名必须以大写字母开头
* 传递给宏函数的参数是引用宏函数所定义的属性组成的对象
* 可以通过`attrs.children`来引用宏函数的子元素

## template

`template`是一个伪元素，它只会渲染子元素，自身不会被渲染成任何内容。这在我们结合`v-for`或`v-if`
等指令，来渲染和判读多个元素时提供了便利。

* <!-- {.example-template} -->
    ```html
    <dl>
        <template v-for={list}>
            <dt>{value.name}</dt>
            <dd>{value.age}</dd>
        </template>
    </dl>
    ```
* <!-- {.example-js} -->
    ```json
    {
        "list": [
            {"name": "Javey", "age": 18},
            {"name": "Tom", "age": 20}
        ]
    }
    ```
<!-- {ul:.example.dom} -->


## 设置临时变量

在标签语法的外部，可以书写任意的js代码，Vdt支持在模板顶部定义函数和变量；

另外在模板内部，也可以通过自执行函数进入js代码区域

* <!-- {.example-template} -->
    ```html
    var a;
    var template = <span>新人</span>

    <div>
        {function() {
            if (isNew) {
                a = 1;
            } else {
                a = 2;
            }
        }.call(this)} 
        <div v-if={a === 1}>{template}</div>
    </div>
    ```
* <!-- {.example-js} -->
    ```json
    {"isNew": true}
    ```
<!-- {ul:.example} -->

上述例子展示了如何在标签语法和js语法间来回切换，标签语法可以直接穿插在js语法中，在标签语法
中使用自执行函数可以切换到js语法

* 自执行函数的返回值必须合法，返回值会当做结果渲染到页面，可以返回`undefined | null`来阻止渲染。
（没有返回值的函数，默认返回`undefined`）
* 自执行函数不应该改变`this`指向，所以应该通过`.call(this)`的方式调用。ES6可以使用箭头函数`(() => {  })()`，甚至`do {  }`语法

## 转义 

Vdt默认会对任何输出转义

* <!-- {.example-template} -->
    ```jsx
    <div>{'<script>alert(1)</script'}</div>
    ```
<!-- {ul:.example} -->

通过`innerHTML`属性，可以阻止转义（本质上就是`element.innerHTML`）

* <!-- {.example-template} -->
    ```jsx
    <div innerHTML={'<script>alert(1)</script>'}></div>
    ```
<!-- {ul:.example} -->

### 非转义

当Vdt作为后端模板渲染时，有时需要输出整段html代码，并且不能使用`innerHTML`来输出。例如：在`<header>`
中，输出整段`<style>`代码。此时可以使用`{= variable }`语法来输出整段非转义代码

```html
<html>
<header>
    <title>test</title>
    {= style }
</header>
<body></body>
</html>
```

## 注释

Vdt没有提供特殊的注释写法，有的只是js和html的注释，所以注释分为两种：
1. 在标签语法里面，可以书写html注释`<!-- 注释 -->`
2. 在js语法里面，可以书写js注释`// 注释` `/* 注释 */`

* <!-- {.example-template} -->
    ```jsx
    // 注释
    <div>
        <!-- 注释 -->
        <h1>标题</h1>
        {// 注释
        }
        {/* 注释 */}
        <div>内容</div>
    </div>
    ```
<!-- {ul:.example} -->

需要注意的是：`// 注释`单行注释需要换行，否则最后的`}`分隔符也会当做注释内容，所以不建议使用，而是使用多行注释`/**/`

```html
<div>
    {// 必须换行，像下面这样}
    {// 换行
    }
</div>
```

[1]: https://github.com/Javey/gulp-vdt
[2]: https://github.com/Javey/vdt-loader
