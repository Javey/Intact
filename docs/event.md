Intact中，事件分为两类：浏览器原生事件和组件事件。

# 监听事件

监听事件使用`ev-*`指令，它既可以监听原生事件，也能够监听组件事件。

## 监听原生事件

```html
<button ev-click={self.onClick.bind(self)}>点击了{self.get('count')}次</button>
```
<!-- {.example} -->

```js
var App = Intact.extend({
    template: template,
    defaults: {
        count: 0
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
    defaults: {
        count: 0
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
<a href="/" ev-click={self.onClick.bind(self)}>阻止默认行为</a>
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
    <Component ev-increase={self.add.bind(self)} />
    组件被点击{self.get('count')}次
</div>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: '<button ev-click={self.onClick.bind(self)}>+1</button>',
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

# 触发事件

## `trigger`方法

组件触发事件的函数为`trigger(eventName, [...args])`

* `eventName` 触发事件名
* `args` 传给事件处理函数的参数

上例中，可以看到触发一个`increase`事件的方法为：`this.trigger('increase')`。
通过它我们还可以为事件处理函数传递数据。

```html
<li ev-click={self.likeThisBook.bind(self)}>{self.get('book')}</li>
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
        ev-like={self.like.bind(self)}
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
<button ev-click={self.add.bind(self)}>+1</button>
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
    <Component ev-$change:count={self.setCount.bind(self)} />
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

### 组件生命周期事件

组件的默认事件除了`$change`类，还有一组跟生命周期相关的事件。详见[组件生命周期][1]

## `on`方法

利用实例提供的`on(eventName, callback)`方法，我们可以给实例对象绑定事件。结合前面提到的默认事件，
我们可以实现类似`watch`的功能。

* `eventName` 监听的事件名
* `callback` 事件回调函数，默认`this`指向触发该事件的实例


```html
<div>
    <button ev-click={self.add.bind(self)}>被点击了{self.get('count')}次</button>
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
