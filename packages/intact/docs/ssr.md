> 服务器端渲染是个复杂的工程，Intact提供了这种能力，但目前没有完全实践。


# 渲染成字符串

组件的`toString()`方法可以将一个组件渲染成字符串。

```js
var App = Intact.extend({
    template: '<div>Hello Intact!</div>'
});

var app = new App();
console.log(app.toString());
// => <div>Hello Intact!</div>
```

# 客户端混合

组件经过服务器渲染后，客户端要与之混合，重新建立起变量和事件等绑定关系。
`Intact.hydrate(Component, dom)`方法可以将一个组件与现有dom混合：

* `Component` 要混合的组件
* `dom` 要混合的根元素，可以理解为`Component`组件`element`的父元素，即挂载的地方。

假设服务器将组件渲染在`<div id="app"></div>`下

```js
Intact.hydrate(App, document.getElementById('app'));
```
