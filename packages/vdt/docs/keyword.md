Vdt模板编译的结果，会添加如下代码

```js
function(obj) {
    var self = this.data, scope = obj;

    ....
}
```

`vdt.render()`方法这样调用模板函数

```js
var vdt = {
    render: function() {
        template.call(vdt, data);

        ...
    }
}
```

所以

* `this` 模板中`this`指向`vdt`实例
* `self` 模板中`self`指向渲染到模板的数据`this.data`
* `scope` 模板中`scope`指向传入模板的数据`data`

一般情况下，`scope === self`，但是当模板存在继承时就不相等了，例如：

* <!-- {.example-template} -->
    ```jsx
    // @file ./layout.vdt
    console.log(self, this)
    <div>
        <p>scope.name: {scope.name}</p>
        <p>self.name: {self.name}</p>
        <p>this.data.name: {this.data.name}</p>
    </div>
    ```

    ```jsx
    var layout = require('./layout.vdt');

    <t:layout name="Vdt" />
    ```
* <!-- {.example-js} -->
    ```js
    var vdt = Vdt(template);
    vdt.render({
        name: 'Virtual-Dom'
    })
    ```
<!-- {ul:.example.dom} -->

上例中，`self & this`保持不变，但是`scope`等于继承`layout`时传入的数据`{name: 'Vdt'}`
