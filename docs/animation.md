Intact自带的`Animate`组件，可以在元素进入，离开和移动时，加入动画效果。你可以实现以下两类动画：

1. css动画，`Animate`组件会在元素改变时添加相应的类名
2. js动画，`Animate`组件会在元素改变时触发相应事件，让你可以操作dom来进行动画

> Vue动画设计很巧妙，Intact借鉴了它的设计的同时，在动画连贯性上做了很多工作，
> 因为实际应用中，enter/leave动画是对称的，即leave是enter动画的反转(reverse)。

# 使用方式

`Animate`的使用方式是，将你需要做动画的元素改成`Animate`组件即可，例如：

```html
<div v-if={self.get('show')}>show</div>

=>

<Animate v-if={self.get('show')}>show</div>
```

上述`Animate`组件会默认渲染成`div`元素，你可以通过`a:tag`改变这一规则

```html
<Animate a:tag="span" v-if={self.get('show')}>show</Animate>
```

这样`Animate`就渲染成`span`元素了。

> `Animate`组件为内部定义的组件，你无需引入它

> `Animate`支持的属性都以`a:`开头，所有非`a:`开头的属性和事件都将传给它代理的元素，例如上例中的`span`。

# CSS动画

## 类名

`Animate`组件会在元素enter/leave的时候增加以下类名

1. `animate-enter`: 元素开始进入时添加，可以定义元素的初始状态
2. `animate-enter-active`：元素进入过程中添加，可以定义元素进入的动画效果
3. `animate-leave`: 元素开始离开时添加，定义元素离开后的最终状态
4. `animate-leave-active`：元素离开过程中添加，定义元素离开的动画效果

以上这些类名的前缀`animate`可以通过`Animate`组件的`a:transition`属性改变。例如：

```html
<Animate a:transition="fade">
```

可以将`animate-enter`替换为`fade-enter`，其它类名同理。

## `transition`动画

通过css动画的类名，我们可以很方便地定义`transition`动画。

```html
<div>
    <button
        ev-click={self.set.bind(self, 'show', !self.get('show'))}
    >展示或隐藏</button>
    <Animate v-if={self.get('show')}>show</Animate>
</div>
```
<!-- {.example} -->

```css
.animate-enter, .animate-leave {
    opacity: 0;
    transform: translateX(10px);
}
.animate-enter-active, .animate-leave-active {
    transition: all 1s;
}
```
<!-- {.example} -->

```js
Intact.extend({template: template});
```
<!-- {.example.auto} -->

> 如果你快速点击按钮，你会发现元素会在中间状态来回切换，而不是突兀地跳到动画开始和结尾，
> 这正是Intact在动画连贯性上做的工作，不过该特性只对`transition`动画支持较好。

## `animation`动画

你可以使用css `animation`属性来设置动画。与`transition`不同的是，`animation`动画会在同一帧
添加`animate-enter-active`类名，而`transition`则是在下一帧添加它。这样做的目的是：保证动画可以
顺利触发，并且不会闪动。

```html
<div>
    <button
        ev-click={self.set.bind(self, 'show', !self.get('show'))}
    >展示或隐藏</button>
    <Animate v-if={self.get('show')}
        a:transition="fade"
    >show</Animate>
</div>
```
<!-- {.example} -->

```css
@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translateX(10px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}
@keyframes fadeOut {
    0% {
        opacity: 1;
        transform: translateX(0);
    }
    100% {
        opacity: 0;
        transform: translateX(10px);
    }
}
.fade-enter-active {
    animation: fadeIn 1s;
}
.fade-leave-active {
    animation: fadeOut 1s;
}
```
<!-- {.example} -->

```js
Intact.extend({template: template});
```
<!-- {.example.auto} -->

> 慎用`animation-direction: reverse`，它会让动画切换过快时，看起来不自然。

> 不要同时使用`transition`与`animation`，会使问题变得复杂。

# JS动画

`Animate`会在动画过程中，触发以下事件：

1. `a:enterStart` 元素进入时触发
2. `a:enter` 元素进入过程中触发
3. `a:enterEnd` 元素进入结束时触发
5. `a:leaveStart` 元素离开时触发
6. `a:leave` 元素离开过程中触发
7. `a:leaveEnd` 元素离开结束时触发

其中，事件回调函数为：

1. `a:enterStart & a:enterEnd & a:leaveStart & a:leaveEnd`事件的回调：`callback(element)`
    * `element`为进行动画的DOM元素

2. `a:enter & a:leave`事件回调：`callback(element, done)`
    * `element`为进行动画的DOM元素
    * `done`动画结束回调函数，该函数调用后，会触发相应的`end`事件

一个使用jQuery动画的例子

```html
<div>
    <button
        ev-click={self.set.bind(self, 'show', !self.get('show'))}
    >展示或隐藏</button>
    <Animate v-if={self.get('show')}
        ev-a:enterStart={self.enterStart.bind(self)}
        ev-a:enter={self.enter.bind(self)}
        ev-a:leave={self.leave.bind(self)}
        a:transition="none"
    >show</Animate>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,

    enterStart: function(el) {
        $(el).css({
            opacity: 0,
            marginLeft: '10px'
        });
    },

    enter: function(el, done) {
        $(el).stop(true, true).animate({
            opacity: 1,
            marginLeft: 0 
        }, {
            complete: done
        });
    },

    leave: function(el, done) {
        $(el).stop(true,true).animate({
            opacity: 0,
            marginLeft: '10px'
        }, {
            complete: done
        });
    }
});
```
<!-- {.example.auto} -->

# 初始化渲染动画

通过给`Animate`组件指定`a:appear={true}`属性，可以设置元素初始化渲染时的动画。和enter/leave动画一样
它将添加`animate-appear & animate-appear-active`类名，并且触发`a:appearStart & a:appear & a:appearEnd`
事件。

```html
<Animate a:appear={true} class="appear">appear</Animate>
```
<!-- {.example} -->

```css
.appear {
    display: inline-block;
    padding: 10px;
    border: 1px solid #eee;
}
.animate-appear {
    transform: scale(0.01);
}
.animate-appear-active {
    transition: all 1s;
}
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: template
});
```
<!-- {.example} -->

定义一个组件来操作上述`Component`的挂载：

```js
var C = Intact.extend({
    template: '<button ev-click={self.append.bind(self)}\
        style="display: block">挂载Component</button>',
    append: function() {
        Intact.mount(Component, document.getElementById('app'));
    }
});
Intact.mount(C, document.getElementById('app'));
```
<!-- {.example} -->

<div class="output"><div id="app"></div></div>

# 多元素动画

上面讲的都是针对单个元素进行动画，如果你将`Animate`嵌套使用，那么父`Animate`组件还能充当动画管理者，
它可以控制所有子`Animate`组件的动画。

```html
<div>
    <button ev-click={self.set.bind(self, 'show', !self.get('show'))}>切换</button>
    <Animate>
        <Animate v-if={self.get('show')} key="show">show</Animate>
        <Animate v-else key="hide">hide</Animate>
    </Animate>
</div>
```
<!-- {.example.auto} -->

> 多元素动画，你必须为每一个子`Animate`组件指定一个唯一的`key`

`Animate`多元素动画时，会默认给离开的元素设置`position: absolute`，所以你会看到上述例子中，动画
元素是重叠的。如果你不想元素离开时绝对定位，你可以设置动画管理者`Animate`组件的`a:move`为`false`。

> `a:move`的作用下面会讲到

## 动画模式

`Animate`管理的子元素，进入/离开是同时进行的，通过动画模式属性`a:mode`，你可以改变这一规则。它的
取值为：

1. `both` 默认模式，同时进入/离开
2. `out-in` 旧元素离开后，新元素再进入
3. `in-out` 新元素进入后，旧元素再离开

使用`out-in`的例子

```html
<Animate a:mode="out-in" a:move={false}>
    <Animate a:tag="button" v-if={!self.get('disabled')}
        ev-click={self.set.bind(self, 'disabled', true)}
        key="on"
        class="static"
    >on</Animate>
    <Animate a:tag="button" v-else
        ev-click={self.set.bind(self, 'disabled', false)}
        key="off"
        class="static"
    >off</Animate>
</Animate>
```
<!-- {.example.auto} -->

## 列表动画

多元素动画最常见的使用场景是列表渲染。例如：

```css
.list div {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #eee;
    margin: 5px;
}
.list-enter, .list-leave {
    opacity: 0;
    transform: translateY(20px);
}
.list-enter-active, .list-leave-active, .list-move {
    transition: all 1s;
}
```
<!-- {.example} -->

```html
<div>
    <button ev-click={self.add.bind(self)}>添加</button>
    <button ev-click={self.remove.bind(self)}>删除</button>
    <Animate a:move={false} class="list">
        <Animate v-for={self.get('list')}
            key={value} 
            a:transition="list"
        >{value}</Animate>
    </Animate>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: function() {
        this.nextNum = 6;
        return {
            list: [1, 2, 3, 4, 5]
        };
    },
    randomIndex: function() {
        return Math.floor(Math.random() * this.get('list').length);
    },
    add: function() {
        var list = this.get('list').slice(0);
        list.splice(this.randomIndex(), 0, this.nextNum++);
        this.set('list', list);
    },
    remove: function() {
        this.get('list').splice(this.randomIndex(), 1);
        this.update();
    }
});
```
<!-- {.example.auto} -->

## 列表位移动画

上述例子存在一个问题：元素插入和删除时，兄弟元素的位置是瞬间移动的，这样显得很突兀。通过设置
列表位移动画，可以使兄弟元素的移动也加入动画。而该功能默认是开启的，就是上面提到的`a:move`属
性。它对应的css类名为`animate-move`，你只需要为该类名添加`transition`样式即可。

```css
.animate-move {
    transition: transform 1s;
}
```
<!-- {.example} -->

```html
<div>
    <button ev-click={self.shuffle.bind(self)}>打乱</button>
    <button ev-click={self.add.bind(self)}>添加</button>
    <button ev-click={self.remove.bind(self)}>删除</button>
    <Animate class="list">
        <Animate v-for={self.get('list')} key={value} a:transition="list">
            {value}
        </Animate>
    </Animate>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: function() {
        this.nextNum = 6;
        return {
            list: [1, 2, 3, 4, 5]
        };
    },
    shuffle: function() {
        this.set('list', _.shuffle(this.get('list')));
    },
    randomIndex: function() {
        return Math.floor(Math.random() * this.get('list').length);
    },
    add: function() {
        var list = this.get('list').slice(0);
        list.splice(this.randomIndex(), 0, this.nextNum++);
        this.set('list', list);
    },
    remove: function() {
        this.get('list').splice(this.randomIndex(), 1);
        this.update();
    }
});
```
<!-- {.example.auto} -->

## 动画模式与列表动画结合

动画模式`a:mode`不仅仅只支持单个元素，对于列表动画也支持。

```html
<div>
    <button ev-click={self.addAndRemove.bind(self)}>添加一个同时删除一个</button>
    <Animate a:mode="in-out" class="list">
        <Animate v-for={self.get('list')} key={value} a:transition="list">
            {value}
        </Animate>
    </Animate>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: function() {
        this.nextNum = 6;
        return {
            list: [1, 2, 3, 4, 5]
        };
    },
    randomIndex: function(num) {
        return Math.floor(Math.random() * (this.get('list').length + num));
    },
    addAndRemove: function() {
        var list = this.get('list').slice(0);
        var addIndex = this.randomIndex(0);
        var removeIndex = this.randomIndex(1);
        while (removeIndex === addIndex) removeIndex = this.randomIndex(1);
        list.splice(addIndex, 0, this.nextNum++);
        list.splice(removeIndex, 1);
        this.set('list', list);
    }
});
```
<!-- {.example.auto} -->

> `Animate`仅支持DOM元素的动画，暂不支持组件的动画
