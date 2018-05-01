Intact中，事件分为两类：浏览器原生事件和组件事件。

# 监听事件

监听事件使用`ev-*`指令，它既可以监听原生事件，也能够监听组件事件。

## 监听原生事件

```html
<button ev-click={self.onClick}>点击了{self.get('count')}次</button>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        return {count: 0};
    },
    onClick: function(e) {
        this.set('count', this.get('count') + 1);
    }
});

Intact.mount(App, document.getElementById('appevent'));
```
<!-- {.example} -->

<div class="output"><div id="appevent"></div></div>

> 原生事件的处理函数记得`bind(self)`，否则函数中`this`将会指向`window`
>
> @since v2.2.0 默认会`bind(self)`，所以无需再次`bind`

利用`bind`方法，我们可以往事件处理函数传递参数。

```html
<div>
    <button ev-click={self.onClick.bind(self, 1)}>赞一下</button>
    <button ev-click={self.onClick.bind(self, 2)}>赞两下</button>
    赞{self.get('count')}
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        return {count: 0};
    },
    onClick: function(num, e) {
        this.set('count', this.get('count') + num);
    }
});

Intact.mount(App, document.getElementById('appevent1'));
```
<!-- {.example} -->

<div class="output"><div id="appevent1"></div></div>

对于原生事件，事件对象将作为最后一个参数传递给事件处理函数。
我们可以通过它访问事件对象的属性和方法，例如，阻止事件的默认行为`preventDefault()`，
阻止冒泡`stopPropagation()`等等。

```html
<a href="/" ev-click={self.onClick}>阻止默认行为</a>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    onClick: function(e) {
        e.preventDefault();
    }
});

Intact.mount(App, document.getElementById('appevent2'));
```
<!-- {.example} -->

<div class="output"><div id="appevent2"></div></div>

## 监听组件事件

绑定组件暴露的事件，和原生事件一样，例如：

```html
var Component = self.Component;
<div>
    <Component ev-increase={self.add} />
    组件被点击{self.get('count')}次
</div>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: '<button ev-click={self.onClick}>+1</button>',
    onClick: function() {
        this.trigger('increase');
    }
});
var App = Intact.extend({
    template: template,
    defaults: {
        count: 0
    },
    _init: function() {
        this.Component = Component;
    },
    add: function() {
        this.set('count', this.get('count') + 1);
    }
});

Intact.mount(App, document.getElementById('appevent3'));
```
<!-- {.example} -->

<div class="output"><div id="appevent3"></div></div>

> 对于组件事件的处理函数，记得`bind(self)`，否则处理函数的`this`
> 指向触发事件的组件实例（上例中：Component实例），而非绑定事件的实例。
>
> @since v2.2.0 无需`bind(self)`，默认会指向绑定事件的实例

# 触发事件

## `trigger`方法

组件触发事件的函数为`trigger(eventName, [...args])`

* `eventName` 触发事件名
* `args` 传给事件处理函数的参数

上例中，可以看到触发一个`increase`事件的方法为：`this.trigger('increase')`。
通过它我们还可以为事件处理函数传递数据。

```html
<li ev-click={self.likeThisBook}>{self.get('book')}</li>
```
<!-- {.example} -->

```js
var Book = Intact.extend({
    template: template,
    likeThisBook: function() {
        // 将book传给事件处理函数
        this.trigger('like', this.get('book'));
    }
});
```
<!-- {.example} -->

```html
var Book = self.Book;

<ul>
    <Book 
        ev-like={self.like}
        v-for={self.get('books')} 
        book={value} 
    />
    你喜欢的书是：{self.get('book')}
</ul>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        this.Book = Book;
        return {
            books: ['Javascript程序设计', '未来简史', '红楼梦']
        }
    },
    like: function(book) {
        this.set('book', book);
    }
});

Intact.mount(App, document.getElementById('apptrigger'));
```
<!-- {.example} -->

<div class="output"><div id="apptrigger"></div></div>

## 组件默认事件

### $change事件

在[Intact实例#$change事件][2]章节，我们介绍过，组件每一次`set()`触发数据变更，
都会触发相应的事件。所以我们可以监听子组件某个属性的变更，而无需子组件
显式地抛出事件。

```html
<button ev-click={self.add}>+1</button>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: template,
    defaults: function() {
        return {count: 0}
    },
    add: function() {
        this.set('count', this.get('count') + 1)
    }
});
```
<!-- {.example} -->

```html
var Component = self.Component;

<div>
    <Component ev-$change:count={self.setCount} />
    子组件被点击了{self.get('count') || 0}次
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    _init: function() {
        this.Component = Component;
    },
    setCount: function(c, count) {
        this.set('count', count);
    }
});

Intact.mount(App, document.getElementById('apptrigger1'));
```
<!-- {.example} -->

<div class="output"><div id="apptrigger1"></div></div>

可以看到`Component`组件并没有显式地抛出事件，但只要`count`变更，就会触发`$change:count`事件。

> 监听`$change:count`设置数据，还是有点麻烦，后面将介绍如何通过`v-model`简化操作

### $receive事件

@since v2.2.0

从v2.2.0开始，组件还提供了一个`$receive`事件，它会在组件接收到父组件传给子组件的变更后的新属性
时触发。与`$change`事件不同的是，`$change`事件只要属性变更就会，不管属性的来源是父组件传递新属性
值导致，还是内部自己改变的。通过`receive`事件，我们可以很方便地修正父组件传给自己的属性值。

例如：下例中，我们将父组件传递的字符串转为数字

```html
<div>
    <button ev-click={self.add}>+1</button>
    value: {self.get('value')} type: {typeof self.get('value')}
</div>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: template,
    defaults: function() {
        return {value: 0}
    },

    _init: function() {
        // 初始化时，也修正
        this._fixValue();
        // 接收到新值时，修正
        this.on('$receive:value', this._fixValue);
    },

    _fixValue: function() {
        // 如果你打开调试工具，可以看到log信息打印的时机
        // 内部改变，或者数据没有变更时不会执行
        console.log('fix value');
        var value = this.get('value');
        this.set('value', Number(value));
    },

    add: function() {
        this.set('value', this.get('value') + 1)
    }
});
```
<!-- {.example} -->

```html
var Component = self.Component;

<div>
    <Component v-model="count" />
    <button ev-click={self._set}>点击这里，将count设为"10"</button>
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        this.Component = Component;
        return {count: '100'};
    },
    _set: function() {
        this.set('count', 10);
    }
});

Intact.mount(App, document.getElementById('receive'));
```
<!-- {.example} -->

<div class="output"><div id="receive"></div></div>


> `$receive`事件只有在更新子组件传递新的属性值时触发，而不会在初始化时触发

### 组件生命周期事件

组件的默认事件除了`$change`类，还有一组跟生命周期相关的事件。详见[组件生命周期][1]

## `on`方法

利用实例提供的`on(eventName, callback)`方法，我们可以给实例对象绑定事件。结合前面提到的默认事件，
我们可以实现类似`watch`的功能。

* `eventName` 监听的事件名
* `callback` 事件回调函数，默认`this`指向触发该事件的实例


```html
<div>
    <button ev-click={self.add}>被点击了{self.get('count')}次</button>
    当点击5次时，会弹出alert
</div>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: function() {
        return {count: 0}
    },
    _init: function() {
        // 监听count变更，等于5次时，弹出alert
        this.on('$change:count', function(c, count) {
            if (count === 5) {
                console.log('$change:count', $('#apptrigger2').find('button').text()) 
                alert('你点击了5次！');
            }
        });
        // 为了测试$change:count和$changed:count的区别
        this.on('$changed:count', function(c, count) {
            if (count === 5) {
                console.log('$changed:count', $('#apptrigger2').find('button').text()) 
            }
        });
    },
    add: function() {
        this.set('count', this.get('count') + 1);
    }
});

Intact.mount(App, document.getElementById('apptrigger2'));
```
<!-- {.example} -->

<div class="output"><div id="apptrigger2"></div></div>

> 上例中，如果你打开控制台，你可能会发现：`$change:count`查询到`button`的文案为：”被点击了4次“；
> 而`$changed:count`查询到的文案为：”被点击了5次“（alert会阻塞渲染，所以界面看不到差别）。这正是
> `$change`与`$changed`事件的差别，前者发生在更新前，后者发生在更新后。

# 解绑事件

组件的`off([eventName, callback])`可以解绑事件，一般不太常用

* `eventName` 要解绑的事件名，如果不传，则解绑组件所有事件
* `callback` 要解绑的事件处理函数，如果不传，则解绑所有`eventName`事件

[1]: #/document/lifecycle
[2]: #/document/instance
