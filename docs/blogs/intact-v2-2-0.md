# Intact v2.2.0 发布

距离Intact上个版本过去了大半年，这半年里，一直致力于基于Intact的组件库[Kpc][2]的开发工作。
而在这次开发过程中，一点一点地将Intact打磨成了一个比较理想的版本。同时也接受了大型组件库，
以及金山云线上项目的洗礼，相信稳定性和便利性都有了质的飞跃。这一版本修复了多处bug的同时，
也加入了一些新特性。而且实现了Intact在Vue中运行的兼容层[intact-vue][3]，进一步拓展了Intact
以及[Kpc][2]组件库的适用范围。

下面将介绍以下本次发布的几个重要更新，其它更新，请见[更新日志][1]:

## $receive事件

`$receive`事件会在组件 __更新__ 的时候，如果检测到传入变更的新属性值，就会触发。

在组件的设计过程中，通常会遇到这样的需求：验证传入组件的属性值是否合法，甚至在不合法的
情况下纠正它，或者传入的某个值并不会在组件中直接使用，而是映射成组件内部维护的另一个
状态值。

虽然在Intact中，只要通过`set`方法设置数据触发了变更，就会抛出`$change`事件。但通过该事件
解决上述问题，存在以下问题：

触发太频繁，因为该事件不管数据来源是外部属性传递，还是内部自己改变都会触发，在事件回调
函数中，我们无法得知该事件的来源，而大多数情况下，内部触发的变更我们是无需去验证和修正该值
的合法性的，同时我们也可能需要根据不同来源处理不同逻辑。

例如，当我们需要对用户传入的`String`类型的数字转换为`Number`类型时，可以如下这么做：

```js
class Component extends Intact {
    defaults() {
        return {
            value: 0
        };
    }

    _init() {
        // 初始化时修正
        this._fixValue();
        // 接收到属性变更时修正
        this.on('$receive:value', this._fixValue);
    }

    _fixValue() {
        this.set('value', Number(this.get('value')) || 0);
    }

    _add() {
        // 内部触发的变更不会触发$receive事件
        this.set('value', this.get('value') + 1);
    }
}
```

> 由于该事件只在更新组件时触发，对于初始化我们需要在`_init`周期函数中手动调用

又例如，对于日期范围选择组件，我们会依次选择开始时间和结束时间，对于`v-model`双向绑定的
选择结果值，我们希望在选择的过程中，将结果置位空，而选择完成后才去设为最终值。此时我们可以
将`v-model`的绑定的属性值`value`映射成内部维护的`_value`来达到目的，但是在外部传入的`value`
的确发生变化时，也要同步更新`_value`。

```js
class Component extends Intact {
    defaults() {
        return {
            value: [],
            _value: [],
        };
    }

    _init() {
        // 初始化时，将value赋给_value
        this.set('_value', this.get('value'));
        this.on('$receive:value', (c, v) => {
            // 接收到外部传入的新值时，同步更新_value
            this.set('_value', v);
        });

        this.on('$change:_value', (c, v) => {
            // 内部_value变化时，去判断是否选择完成，如果没有，则置为空数组
            if (v && v.length === 1) {
                v = [];
            }
            this.set('value', v);
        });
    }

    ...
}
```

如果我们将上面中的`$receive`替换成`$change`会发生什么？

```js
this.on('$receive:value', (c, v) => {
    // 接收到外部传入的新值时，同步更新_value
    this.set('_value', v);
});

=>

this.on('$change:value', (c, v) => {
    // 只要value变更就会同步更新_value
    this.set('_value', v);
});
```

当内部只选择了开始时间时，`_value`取值类似于`['2018-05-01']`，此时触发的`$change:_value`事件
会将`value`置为`[]`，而这又会触发`$change:value`事件，又将`_value`设为空了`[]`，
用户将永远选择空数组`[]`。而`$receive:value`则会很好地解决这一问题，因为它只在
外部传递的属性值变更时触发。

## `<b:block>`语法在组件中的应用

在之前的版本中，`<b:block>`只能配合模板继承`<t:template>`使用，如果你需要往组件中传入子模板，
需要通过属性值来传递，这会给复杂模板的传递带来麻烦。现在`<b:block>`也可以用于在组件
中传递子模板，类似于Vue中的`slot`，不同的是它依然支持`parent()`调用组件中的默认模板内容。

例如，定义一个简化的Dialog组件如下

```html
// @file dialog.vdt
<div class="dialog">
    <b:header>
        <div class="header">{this.get('title')}</div>
    </b:header>
    <b:body />
</div>
```

```js
// @file dialog.js
import template from './dialog.vdt';
import Intact from 'intact';

export default class Dialog extends Intact {
    @Intact.template()
    static template = template;

    defaults() {
        return {title: 'Title'};
    }
}
```

上述`Dialog`组件中，我们在模板中定义了`header`和`body`两个`block`块，其中`header`定义了默认
模板内容`<div class="header">{this.get('title')}</div>`，而`body`为空`block`。下面我们使用该组件，
并往特定区域填充内容

```html
import Dialog from './dialog';

<Dialog>
    <b:header>
        {parent()}
        <button class="close">X</button>
    </b:header>
    <b:body>
        Hello Intact!
    </b:body>
</Dialog>
```

在往`header`这个`block`中填充内容时，我们可以通过`parent()`方法引用该`block`在组件模板中的默认
内容。所以它的渲染结果为：

```html
<div class="dialog">
    <div class="header">Title</div>
    <button class="close">X</button>
    Hello Intact!
</div>
```


[1]: https://javey.github.io/Intact/#/document/changelog
[2]: https://ksc-fe.github.io/kpc/
[3]: https://github.com/Javey/intact-vue
