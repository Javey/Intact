# 创建实例

Intact中，必须先创建组件才能实例化，而不是在创建组件的同时指定挂载元素的位置。

首先我们通过`Intact.extend()`方法，创建一个组件

```js
var Component = Intact.extend({
    template: '<div>test</div>'
});
```

> 组件必须具有`template`属性，才能被实例化

然后，我们可以直接通过`Intact.mount()`方法，将组件挂载到某个元素下

```js
var instance = Intact.mount(Component, document.getElementById('app'));
```

## 实例化挂载 

如果你想更多地控制组件的挂载细节，例如：挂载时传入数据，或者待异步组件初始化完成
才挂载，可以像下面这样自己完成组件的实例化和挂载。

组件创建好后，可以通过`new`操作符直接创建实例

```js
var instance = new Component({
    // 数据
});
```

在调用构造函数时，可以传入数据，该数据将会和组件定义的默认数据合并，然后通过
实例`get()`方法来获取相应的数据。

上述创建出来的实例，并没有调用模板函数生成dom。需要调用实例的`init()`方法来
生成dom元素。

```js
var dom = instance.init();
```

`init()`方法会返回创建的dom元素，同时该元素也会赋给实例的`element`属性，
所以有：

```js
dom === instance.element; // true
```

> 注意：对于异步组件，如果还没初始化完成就调用`init()`方法，则会返回一个注释节点
> 当做占位符，此时`element`属性也不存在。关于异步组件下面将详细说明

然后我们可以将该dom挂载到我们指定的元素上。

```js
document.getElementById('app').appendChild(dom);
```

通过上述步骤初始化实例，有个问题：组件的`mount`周期，会在`init()`方法调用后立即
执行，而非等到`appendChild()`调用之后，这在某些情况下可能存在问题，因为`mount`周期
本意就是：组件挂载之后执行。所以我们应该在`init()`之前`appendChild()`之后，还需做
额外的工作。

1. 在`init()`之前，我们为实例创建个挂载队列，让所有需要组件挂载后才执行的函数放入
   该队列，待组件挂载后手动触发执行
    ```js
    instance._initMountedQueue();
    ```
2. 在`appendChild()`之后，让队列函数执行
    ```js
    instance._triggerMountedQueue();
    ```

这样，我们就完成了组件的从实例化到挂载渲染的工作。虽然步骤比较多，但我们可以
控制整个过程的每个细节，这在有些组件的使用中会提供极大的定制化和便利性。


# 操作数据 

Intact组件的数据由两部分组成，首先是定义组件时指定的数据`defaults`，其次是实例化
组件时传入的数据，这两部分数据合并后会作为组件的`props`属性保存起来。然后我们通过
实例方法`set()/get()`来操作它们。

1. `set(key, value[, options])` 设置数据
    * `key` 设置的键名
    * `value` 对应的值
    * `options` 配置参数
2. `set(obj[, options])` 设置数据
    * `obj` 批量设置的对象
    * `options` 配置参数
3. `get([key])` 获取数据
    * `key` 获取数据的键名，不传则获取全部数据

```js
var Component = Intact.extend({
    defaults: function() {
        return {num: 1};
    },
    template: "<div>{self.get('num')}</div>"
});

var instance = new Component({
    num: 2,
    count: 2
});

console.log(instance.props); // {num: 2, count: 2}
// 通过get()获取数据
instance.get() === instance.props; // true
instance.get('num') === 2; // true

// 通过set()设置数据
instance.set('num', 3);
// 批量设置
instance.set({
    num: 4,
    count: 3
});
```

## 静默更新

通过`set()`方法设置数据，一旦触发了数据变更，则会自动调用`update()`方法来更新界面。
我们也可以通过指定`options`来改变这一行为:

```js
// 即使改变了num，也不会更新界面，也不会有相应的$change事件触发
// 关于事件，请参考事件章节
instance.set('num', 5, {silent: true}); 

// 即使改边了num，也不会更新界面，但会有相应的$change事件触发
instance.set('num', 6, {update: false});
```

## 合并更新

每次调用`set()`方法，如果触发了数据变更，都会调用`update()`来更新界面。如果`set()`频繁
调用，则会导致性能降低。所以我们应该将多次改变一次性set

```js
instance.set({
    num: 4,
    count: 3
});
```

另外`set()`方法提供了`{async: true}`参数，来将一个同步操作周期里的所有更新合并成
一次更新

```js
// 以下两次set将合并成一次更新
instance.set('num', 4, {async: true});
instance.set('count', 3, {async: true});
```

## 改变对象嵌套子属性

对于嵌套较深的对象，`set()`方法可以像`lodash.set()`那样，通过指定路径，改变深层次的属性值。
但该特性只支持单个属性的改变，并不能批量改变。

```js
instance.set('a', {b: {c: 1}});
// 改变a.b.c
instance.set('a.b.c', 2);

// < v2.2.6  如果批量设置，将会新增一个属性并赋值 
instance.set({'a.b.c': 3}); // {a: {b: {c: 2}}, 'a.b.c': 3}
// >= v2.2.6 会通过路径修改属性
instance.set({'a.b.c': 3}); // {a: {b: {c: 3}}}
```

> Intact比较数据的变更，并非单纯地`===`，对于对象，会递归地比较每一项的值。
> 例如：`var a = {a: 1}; var b = {a: 1}`，很显然`a === b`为`false`，因为它们
> 都是引用类型，比较的是引用地址，但你`this.set(data, a)`后再`this.set(data, b)`
> 并不会触发变更来更新模板。因为从字面量上来说，`a`和`b`是相等的。
>
> 另一种情况，如果你`this.set(data, a)`后，直接更改`a`的属性值`a.a = 2`，然后试图
> 重新设置`this.set(data, a)`来让模板更新是行不通的。因为`a`的引用地址没变，对`data`
> 属性来说，每次设置的都是同一个值。不过你可以调用`this.update()`强制更新模板。

> `get()`方法也支持路径取值

## $change事件

每一次调用`set()`，如果触发变更，则会触发相应的事件出来。通过监听这些事件，可以实现类似
`watch`的功能。

```js
// 会相继触发`$change:num`, `$change`, `$changed:num`, `$changed`事件
instance.set('num', 100);

// 会相继触发`$change:num`, `$change`，但不会触发`$changed:num`, `$changed`事件
instance.set('num', 101, {update: false});

// 不会触发任何事件
instance.set('num', 102, {silent: true});

// 对于嵌套对象，同上
// 会相继触发`$change:a.b`, `$change:a`, `$change`, 
// `$changed:a.b`, `$changed:a`, `$changed`事件
instance.set('a.b', 1);
```

### 事件回调函数

1. 对于`$change:*`, `$changed:*`事件的回调函数
    * function(instance, newValue, oldValue)
        * `instance` 触发相应事件的对象
        * `newValue` 变更后的数据
        * `oldValue` 变更前的数据。但是对于引用类型，是不会保存变更前的数据的，
          它将等于`newVaue`

2. 对于`$change`, `$changed`事件的回调函数
    * function(instance, changes)
        * `instance` 触发相应事件的对象
        * `changes` 变更的数据的键名数组，标识那些属性被变更

> 关于事件绑定细节，详见[事件处理][1]

[1]: #/document/event
