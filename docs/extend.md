常见的组件使用方式是组合，而继承为组件提供了另一种复用的能力。借助于Vdt模板引擎的继承机制，以及JS和
CSS的原生继承能力，Intact能够实现组件的完全继承。

# 继承的优势

在实际开发中，组件按照复用性可以划分为两类：__可复用组件__ 和 __不可复用组件__。

可复用组件很好理解，一个按钮，一个表格都是可复用组件，它们是组成页面的基本元素，如果你组件设计得够好，
可以复用在绝大多数页面开发中。但是有一种组件你没法抽象它，那就是页面级组件。实际开发中，不同页面之前
可能千差万别，你没法定义一个组件来适用于绝大多数页面，基本上都是一个页面一个组件。可是同一个项目，你
又会发现每个页面之前可能存在共同点，比如有相似的头部。注意，仅仅只是相似而已，你可能仍然需要在每个页
面中，对头部做特殊化定制。

针对这种情况，传统的做法是：将页面的骨架定义一个组件A，将页面的内容定义成另一个组件B，然后将B组件传入
A组件进行渲染。但这样做的弊端是，组件B无法控制组件A中定义的头部，如果要定制化头部，则必须通过A暴露的
接口来达到目的。当页面较多时，如果每个页面都有特殊的定制化需求，那A组件需要提供大量的接口来满足，势必
造成A组件的无限膨胀。

而继承却可以很好的解决这个问题，因为继承是代码层面的复用，而不是组件的复用，实际上A组件和B组件已经合
并成一个AB组件了，对AB组件来说，头部和内容区域都是它的一部分，自然他能控制页面的全部。头部定制化的逻
辑可以分散到各个派生的子组件中。

另外一个优势便是：继承可以 __重写(override)__ 父类同名属性和方法，并且在你重写的过程中，你可以访问父类
同名属性和方法(super)。而这是其它类似参数传递或者混入(mixin)所无法做到的。

# Vdt模板继承

要达到上述目的，我们需要定义可扩展的模板，Vdt模板引擎提供了这种能力，你可以参考[Vdt文档][1]了解详情。

## 定义可扩展的模板

使用`<b:block>`指令，你可以定义可扩展的模板。你只需要将它放置在需要扩展的地方，然后给它一个名称即可。

```html
<div class="page">
    <b:header>
        <header>
            <b:header-content>
                page header
                <div ev-click={self.toggleShow.bind(self)}>
                    {self.get('userName')}
                </div>
                <ul v-if={self.get('show')}>
                    <li>用户中心</li>  
                    <li>退出</li>
                </ul>
            </b:header-content>
        </header>
    </b:header>
    <b:body>
        <div class="content">
            <b:content />
        </div>
    </b:body>
</div>
```

上例中，我们定义了页面的结构，头部包含一个展示用户信息的模块，并且提供了大量的可扩展点。实际开发时，你
可以根据需要控制可扩展粒度。

> `<b:block>`指令可以嵌套，但同一模板中，不要重名

## 继承模板

使用`<t:template>`指令，你可以继承模板。其中`template`为被继承的模板的模板函数名。

下面将上述模板编译成模板函数传入要继承的模板中，这里我们在头部新增一个返回按钮。

```html
var layout = self.layout

<t:layout>
    <b:header-content>
        <button ev-click={self.back.bind(self)}>返回</button>
        {parent()}
    </b:header-content>
    <b:content>
        Page A <br />
        data: {self.get('data')}
    <b:content>
</t:layout>
```

至此我们完成了模板继承，剩下的事情便是定义组件来管理它们了。

# Intact组件继承

前面已经提过，使用`Intact.extend()`方法即可完成组件的继承。

## 定义父类组件

我们可以将所有页面的公共逻辑放入父类组件，然后子类组件继承它。在这里我们将用户信息模块的逻辑定义在父类组
件中。

```js
var Layout = Intact.extend({
    defaults: function() {
        return {
            show: false
        }
    },

    // 假设父模板编译后的模板函数名为parentTemplate
    template: parentTemplate,

    _init: function() {
        // 用户信息是个通用模块，我们在父类组件获取用户数据
        var self = this;
        return new Promise(function(resolve) {
            setTimeout(function() {
                self.set('userName', 'Javey');
            }, 100)
        });
    },

    toggleShow: function() {
        this.set('show', !this.get('show'))
    }
});
```

## 继承父类组件

组件可以再被继承，下面我们定义一个子类组件继承上述组件，并扩展它。

```js
var Page = Layout.extend({
    template: template,

    back: function() {
        histroy.back();
    }
});
```

上述扩展，仅仅新增了一个方法`back()`，就像所有类的继承一样，我们还可以重载父类的方法。在重载方法里，通过
以下两个方法，可以调用父类的方法：

* `this._super([...args])` 调用父类的同名方法，并且传入参数
* `this._superApply([args])` 调用父类的同名方法，并且以数组的形式传入参数

> 上述两个方法不能在异步函数中调用，如果需要在异步函数中调用，请先用变量将它们保存起来

大多数情况下，每个页面除了父类`Layout`中定义的获取用户数据之外，还需要获取页面自己需要的数据。通过上述方法
我们可以很方便做到。

```js
var Page = Layout.extend({
    ...
    _init: function() {
        var self = this;
        // 注入父模板函数
        this.layout = parentTemplate; 
        return Promise.all([
            // 调用父类同名方法_init
            this._super(),
            new Promise(function(resolve) {
                setTimeout(function() {
                    self.set('data', 'hello')
                });
            })
        ]);
    }
    ...
});
```

至此我们完成了组件的继承，这样每个页面对应的`Page`组件，都可以完整控制整个页面的逻辑，并且最大限度地提高了
组件的复用性。

# 父模板函数parent

上例中，我们在继承父模板时，需要注入相应的父模板函数。这种方式可以让你继承任意的父模板，而并非
一定是父类组件中定义的模板。但大多数情况下，我们都会继承父类组件中定义的模板，在子模板中，通过
`parent`模板函数名即可引用到父模板函数。

例如上例中，子模板无需注入`this.layout = parentTemplate`，而是像下面这样做

```html
// 直接通过parent引用父类中定义的模板
<t:parent>
    <b:header-content>...</b:header-content>
    <b:content>
        ...
    </b:content>
</t:parent>
```

逻辑部分，无需注入父模板

```js
var Page = Layout.extend({
    template: template,
    
    _init: function() {
        return Promise.all([
            ...
        ]);
    }
});
```

## ES6

如果你使用`class`语法定义组件，则需要使用`Intact.template()`修饰器来修饰`template`属性，
这样才能够在派生组件中使用`parent`变量引用到父类组件定义的模板

```js
class Layout extends Intact {
    @Intact.template()
    get template() {
        return `
            <div>
                <b:body>Layout</b:body>
            </div>
        `;
    }
}

class Page extends Layout {
    @Intact.template()
    get template() {
        return `
            <t:parent>
                <b:body>{parent()} Page</b:body>
            </t:parent>
        `;
    }
}
```

> 使用修饰器(Decorator)语法，需要babel插件支持，babel@6可以这样做
> `npm install --save-dev babel-plugin-transform-decorators-legacy`，然后在`.babelrc`中
> 加入`"plugins": ["transform-decorators-legacy"]`

> 完整地控制整个页面，正是`Intact`一词的由来

[1]: http://javey.github.io/vdt.html#/documents/template
