组件离不开生命周期，通过生命周期，我们可以控制组件的各个渲染细节。

一个Intact组件完整的生命周期为

```
                        销毁后
_init -> _beforeCreate[@since v2.4.1] -> _create -> _mount -> _destroy
                                          | 触发更新时 
                                          v
                                 _beforeUpdate -> _update
```

当组件后端渲染时，只会执行以下两个周期函数

```
_init -> _beforeCreate
```

# 组件周期函数

## _init

组件初始化的时候调用，此时组件还没开始渲染。我们我可以在该周期中
做组件数据初始化的工作，绑定事件，注入变量用于模板渲染等等。
该生命周期可以返回`Promise`来支持异步组件。

## _beforeCreate `@since v2.4.1`

组件初始化完成后，准备渲染DOM之前，会执行该生命周期函数。此时，组件
实例具有`vNode` `parentVNode`属性，可以通过它来操作`VNode`对象，但是
没有`DOM`对象，所以不要在该周期函数中操作`DOM`。该周期函数后端渲染情况下
也会执行

## _create

组件渲染完成模板渲染后，就会调用该生命周期。此时，组件具有`element`
属性，指向组件渲染的DOM元素，但此时DOM并没有挂载。

## _mount

组件被挂载后，该生命周期函数会被调用

## _beforeUpdate

组件渲染完成后，如果触发更新操作，就会执行_beforeUpdate，在DOM还没有
渲染时，所有的update动作都不会调用该生命周期函数。

## _update

_beforeUpdate调用后，就会执行_update，此时组件更新完成。

## _destroy

组件被销毁后，会执行_destroy，在这里可以做一些组件清理工作。组件销毁时，
会递归清理所有的子组件，解绑所有事件。

> 上述周期函数是Intact提供的接口，另外Intact和底层与虚拟DOM打交道时，
> 也有周期函数的概念，它们分别为`init`, `mount`, `update`, `destroy`，
> 需要注意的是，它们和上面的周期函数接口并非一一对应，在这里提出来，
> 是为了防止组件自定义函数与它们命名冲突，你也可以直接调用它们完成
> 一些特定工作。

# 组件周期标识 

与周期函数相对应的时，组件还会在特定状态下，设定一些特定标识，让组件
使用者可以知道，当前组件处在哪个周期。

## inited

* default `false`

标识组件是否初始化完成，指`_init()`周期函数是否执行完成。这个标识在
处理异步组件时非常有用。如果`_init()`方法返回一个`Promise`对象，那么组件
只有在该`Promise`成功回调之后，才将`inited`置为`true`

## rendered

* default `false`

标识组件是否完成渲染。在初始化完成成功（异步组件成功回调后），`_create()`
周期之前，该标识会被置为`true`，表示组件已经渲染完成，DOM已经创建，我们
可以通过`element`属性获取到该DOM元素。

## mounted

* default `false`

标识组件是否已经挂载。组件被挂载后，该标识会被置为`true`。

## destroyed

* default `false`

标识组件是否已经销毁。组件被销毁后，该标识会被置为`true`。

# 组件周期事件

与组件周期相关的，还有一组特定的周期事件，它们会在组件状态变更后，触发出来。
通过它们，我们可以在组件外部追加特定的周期逻辑。

## $inited

组件完成初始化后触发，对应`inited`为`true`

## $rendered

组件渲染完成后触发，对应`rendered`为`true`

## $mounted

组件挂载后触发，对应`mounted`为`true`

## $destroyed

*@since v2.1.0*

组件销毁时触发，对应`destroyed`为`true`
