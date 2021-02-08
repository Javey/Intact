## 继承

继承能够创建可复用的模板，定义页面的骨架，然后被子模板填充，子模板又可以作为父模板被继承。

继承主要通过两个标签语法实现

* `<t:template>` 定义要继承的父模板
* `<b:block>` 在父模板中用来定义可以被填充的区域；在子模板中用来定义将内容填充到父模板的指定区域

定义父模板`layout.vdt`

```jsx
<div>
    <b:header>
        <div>父模板头部</div>
    </b:header>
    <div>
        <b:content>父模板内容</b:content>
    </div>
</div>
```

### 模板加载

* 后端渲染时，可以直接在在模板中使用`require()`方法来加载父模板
    ```jsx
    var layout = require('./layout');

    <t:layout>
        <b:header>
            <div>子模板头部</div>
        </b:header>
        <b:content>
            {parent()}
            <div>子模板内容</div>
        </b:content>
    </t:layout>
    ```

* 浏览器渲染时，有多种方法来加载父模板

    1. 你可以直接将父模板编译后传入子模板的`render`方法中，此时模板的加载任务在模板外部进行

        如果你采用纯前端编译运行，你的模板可以通过`<script>`标签定义在html中，类似这样
        ```html
        <script type="text/vdt" id="parent_template">
            <div>
                <b:header>
                    <div>父模板头部</div>
                </b:header>
                <div>
                    <b:content>父模板内容</b:content>
                </div>
            </div>
        </script>
        ```

        由于模板加载的任务在模板外部进行，此时你的子模板无需处理父模板的加载，只需`render`时传入编译后的父模板即可
        ```html
        <script type="text/vdt" id="child_template">
            <t:layout>
                <b:header>
                    <div>子模板头部</div>
                </b:header>
                <b:content>
                    {parent()}
                    <div>子模板内容</div>
                </b:content>
            </t:layout>
        </script>
        ```

        然后在前端实时编译`Vdt.compile(source)`父模板，传入子模板中
        ```js
        var layout = Vdt.compile(document.getElementById('parent_template').text()),
            vdt = Vdt(document.getElementById('child_template').text());
        // 在render方法中，传入编译好的父模板
        vdt.render({layout: layout});
        ```
    2. 大部分时候，我们都是将模板拆分成单独的文件，然后前端按需加载，此时我们需要一种方法来加载模板文件。
    当然你可以使用`$.ajax({dataType: 'text'})`的方式来异步加载模板，然后前端实时编译。
    但从性能上考虑，更推荐前端使用模块加载器`RequireJs`等工具来加载编译好的文件。
        * 后端编译的情况下，使用`Vdt.middleware`可以很方便地将`Vdt`实时编译成`js`文件
        * 前端编译的情况下，可以使用[gulp-vdt][1]插件将`Vdt`提前编译成`js`文件

        上述工具可以将模板编译成`amd`风格的模块，所以我们可以在模板中直接加载当前模板所需的依赖，
        将模板的依赖交给模板自己处理

        使用`RequireJs`加载模板的例子

        父模板`layout.vdt`定义不变，子模板`child.vdt`中处理模板加载，需要注意路径问题
        ```jsx
        // 注意RequireJs加载文件路径配置
        var layout = require('/static/js/layout');

        <t:layout>
            <b:header>
                <div>子模板头部</div>
            </b:header>
            <b:content>
                {parent()}
                <div>子模板内容</div>
            </b:content>
        </t:layout>
        ```

        ```js
        // 将模板的依赖交给模板自己处理，js中无需关心 
        define(['/static/template/child'], function(childTemplate) {
            var vdt = Vdt(childTemplate);
            vdt.render();
        });
        ```

    3. 可以借助`webpack`打包工具，将所有依赖整合成单文件。`Vdt`提供了配套工具[vdt-loader][2]来加载`Vdt`模板文件

        `webpack.config.js`配置中添加

        ```js
        module: {
            loaders: [
                test: /\.vdt$/,
                loader: 'vdt-loader'
            ]
        }
        ```

        此时在子模板中，直接加载依赖。

        ```jsx
        // 加上vdt后缀
        var layout = require('./layout.vdt');

        <t:layout>
            <b:header>
                <div>子模板头部</div>
            </b:header>
            <b:content>
                {parent()}
                <div>子模板内容</div>
            </b:content>
        </t:layout>
        ```

        __鉴于ES6和webpack的普及，这种方式是最推荐的做法，所以后面的例子中，我们都会采用这种写法，当然你也可以使用`import`语法加载依赖__

### 继承标签语法

模板加载的问题解决后，我们来看看`Vdt`提供的两个实现继承的标签语法

* `<t:template>` 定义要继承的父模板，其中`template`是父模板名称（非文件名）
* `<b:block>` 定义往父模板哪个区域填充内容，其中`block`为父模板中定义的`block`名称。需要注意以下规则：
    * 如果不存在嵌套，并且该`block`在父模板中找不到对应`block`名，则该`block`将被忽略
        ```jsx
        var layout = require('./layout.vdt');

        <t:layout>
            <b:name>由于父模板不存在名称为name的block，所以该内容会被忽略</b:name>
        </t:layout>
        ```
    * 如果存在嵌套，并且被该`block`嵌套的`block`在父模板中找不到对应`block`名，则该`block`将被忽略
        ```jsx
        var layout = require('./layout.vdt');

        <t:layout>
            <b:name>
                <b:content>
                    虽然父模板中存在content block，但不存在name block，
                    所以该内容会被忽略
                </b:content>
            </b:name>
        </t:layout>
        ```
    * 如果父模板定义的`block`没有被子模板填充，则父模板中的内容将会直接输出
        ```jsx
        var layout = require('./layout.vdt');
        
        // 没有填充父模板的任何block，则父模板中定义的内容都会输出
        <t:layout />
        ```

完整的继承例子渲染结果如下：

* <!-- {.example-template} -->
    ```jsx
    // @file ./layout.vdt
    <div>
        <b:header>
            <div>父模板头部</div>
        </b:header>
        <div>
            <b:content>父模板内容</b:content>
        </div>
    </div>
    ```
    ```html
    var layout = require('./layout.vdt');

    <t:layout>
        <b:header>
            <div>子模板头部</div>
        </b:header>
        <b:name>
            该内容不会输出
        </b:name>
    </t:layout>
    ```
<!-- {ul:.example} -->

### 引用父级`parent()`

有时候，继承父模板后不一定要完全替换所有父模板中定义的内容，此时可以通过`parent()`方法来
引用当前`block`对应的父模板中的内容，你可以将该内容插在当前`block`的任意地方，若有必要，你可以调用该方法任意次

* <!-- {.example-template} -->
    ```jsx
    // @file ./layout.vdt
    <div>
        <b:content>
            父模板内容
        </b:content>
    </div>
    ```
    ```jsx
    var layout = require('./layout.vdt')
    <t:layout>
        <b:content>
            {parent()}
            前面插一份
            {parent()}
            中间插一份
            后面插一份
            {parent()}
        </b:content>
    </t:layout>
    ```
<!-- {ul:.example} -->

### `block`嵌套

`block`可以任意嵌套，但在一个模板中要保证`block`名称不重复

* <!-- {.example-template} -->
    ```jsx
    // @file ./layout.vdt
    <div>
        <b:body>
            <aside>
                <b:sidebar>边栏</b:sidebar>
            </aside>
            <article>
                <b:content />
            </article>
        </b:body>
    </div>
    ```
    ```jsx
    // @file ./child.vdt
    var layout = require('./layout.vdt');

    <t:layout>
        <b:content>只修改content block</b:content>
    </t:layout>
    ```
<!-- {ul:.example} -->

### 带参数的`block`

`block`可以传递参数，我们可以在父模板中传递参数给子模板，子模板中接受参数后，可以根据不同的数据
渲染不同的结果。这在`v-for`渲染中很有用，我们可以动态每一次渲染的结果

1. 首先我们需要在父模板中给`block`指定实参，通过`args`属性指定，该属性值是一个数组
2. 然后在子模板中给`block`指定形参，通过`params`属性指定，该属性值是一个字符串

* <!-- {.example-template} -->
    ```jsx
    // @file ./list.vdt
    <ul>
        <li v-for={data}>
            <b:item args={[value, key]}>{value.name}</b:item>
        </li>
    </ul>
    ```
    ```jsx
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
<!-- {ul:.example.dom} -->

上例中，父模板的`item`block通过`args`传入`value` `key`当做实参，子模板通过`parmas`定义形参。可以
看到，我们依然可以通过`parent()`访问到父模板中定义的内容

### 继承后再继承

模板可以继承后再被继承，继承链可以任意长。例如上面定义的子模板可以当做父模板再被继承

* <!-- {.example-template} -->
    ```jsx
    var child = require('./child.vdt');

    <t:child>
        <b:sidebar>
            来自孙模板的边栏
            {parent()}
        </b:sidebar>
        <b:content>
            {parent()}
            来自孙模板的内容
        </b:content>
    </t:child>
    ```
<!-- {ul:.example} -->

## 包含

包含也是实现模板复用的一个重要功能，`Vdt`中并没有提供`include`标签语法，但是通过前面的继承语法`<t:template>`
可以很方便地实现包含

* <!-- {.example-template} -->
    ```jsx
    // @file ./list.vdt
    <table>
        <thead>
            <tr><th>ID</th><th>姓名</th></tr>
        </thead>
        <tbody>
            <td>0</td><td>Vdt</td>
        </tbody>
    </table>
    ```

    ```jsx
    var list = require('./list.vdt');

    <div>
        <h1>用户列表</h1>
        将list内容放在下面
        <t:list />
    </div>
    ```
<!-- {ul:.example.dom} -->

### 传递数据

在使用`<t:template>`时，通过指定属性，可以传递数据给被包含的模板。在父模板中可以通过`scope`对象来获取属性值

* <!-- {.example-template} -->
    ```jsx
    // @file ./list.vdt
    <table>
        <thead>
            <tr><th>ID</th><th>姓名</th></tr>
        </thead>
        <tbody>
            <tr v-for={scope.data}>
                <td>{key}</td><td>{value}</td>
            </tr>
        </tbody>
    </table>
    ```

    ```jsx
    var list = require('./list.vdt');

    <div>
        <h1>用户列表</h1>
        <t:list data={['Syalvia', 'Shadow', 'Javey']} />
    </div>
    ```
<!-- {ul:.example.dom} -->

### 局部继承

`<t:template>`可以在任意地方使用，不一定是根元素，所以可以很方便地实现局部继承

* <!-- {.example-template} -->
    ```jsx
    // @file ./content.vdt
    <div>
        <h1>{title}</h1>
        <b:content>
            被包含文件的内容
        </b:content>
    </div>
    ```
    ```jsx
    var content = require('./content.vdt');

    <div>
        将content模板放在下面，并且扩展它
        <t:content title="标题">
            <b:content>
                包含文件内容
                {parent()}
            </b:content>
        </t:content>
    </div>
    ```
<!-- {ul:.example} -->

