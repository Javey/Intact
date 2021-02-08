## 创建Vdt实例

### `Vdt(template)`

* @param template `{String | Function}` 用来创建实例的模板，既可以是模板字符串，也可以是模板函数
* @return `{Vdt Object}`

通过`Vdt(template)`方法可以创建一个`Vdt`实例

```js
var vdt;

// 传入模板字符串
vdt = Vdt('<div></div>');

// 或者，传入模板函数
vdt = Vdt(Vdt.compile('<div></div>'));
```

## 属性和方法

### `vdt.render([data])`

* @description 渲染模板
* @param data `{Object}` 用来渲染模板的数据
* @return {HtmlElement} 返回渲染出来的dom

### `vdt.renderString([data])`

* @description 渲染模板，结果为html字符串
* @param data `{Object}` 用来渲染模板的数据
* @return {Html String} 返回渲染出来的html字符串

### `vdt.update([data])`

* @description 更新模板
* @param data `{Object}` 用来更新模板的数据，如果传入该数据，则原始数据将会被它替换掉
* @return {HtmlElement} 返回更新后的dom

### `vdt.hydrate(data, dom)`

* @description 给已存在的dom建立到vdt的绑定。这在前后端同构的项目中，可以用于前端混合
* @param data `{Object}` 用来混合的数据
* @param dom `{HtmlElement}` 将要混合的dom元素
* @return {HtmlElement} 返回混合后的dom

### `vdt.data`

* @description 指向渲染/更新模板的数据

创建Vdt实例后，通过`render()`方法，传入数据即可渲染出需要的dom节点，后续可以通过`update()`方法去更新dom

```js
var data = {a: 1};
vdt.render(data);

vdt.data === data; // true
vdt.data.vdt === vdt; // true

// 更新
var newData = {a: 2};
vdt.update(newData);

// 不传入新数据，而是修改原始数据去更新
vdt.data.a = 3;
vdt.update();
```

### `vdt.node`

* @description 指向渲染/更新模板后的dom

### `vdt.template`

* @description 指向实例的模板函数
