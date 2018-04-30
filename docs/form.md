Vdt模板提供的`v-model`指令，可以实现数据的双向绑定。本质上它是如下语法的语法糖，
只不过针对不同的表单控件，做了特殊处理。

```html
<input v-model="value" />

=>

<input 
    ev-input={function(e) { self.set('value', e.target.value); }}
    value={self.get('value')}
>
```

# 基础用法

## 文本框

```html
<div>
    <input v-model="text" />
    <p>你的输入是：{self.get('text')}</p>
</div>
```
<!-- {.example.auto} -->

## 多行文本框

```html
<div>
    <textarea v-model="text" />
    <p>你的输入是:</p>
    <pre>{self.get('text')}</pre>
</div>
```
<!-- {.example.auto} -->

> 使用`<textarea>{self.get('text')}</textarea>`并不能双向绑定，请使用`v-model`

## 复选框

### 单个复选框 

单个复选框默认返回的是布尔值

```html
<div>
    <input type="checkbox" v-model="checked" />
    当前checked的值为：{String(self.get('checked'))}
</div>
```
<!-- {.example.auto} -->

> 由于我们没有初始化`checked`属性，所以初始值为`undefined`

### `v-model-true & v-model-false`

上述例子，默认绑定的是布尔值，通过`v-model-true`和`v-model-false`指令，
我们可以定义选择和非选择状态时的值

```html
<div>
    <input type="checkbox"
        v-model="value" 
        v-model-true={1}
        v-model-false="a"
    />
    当前value为：{JSON.stringify(self.get('value'))}
</div>
```
<!-- {.example.auto} -->

> `v-model-true`和`v-model-false`的值如果为引用类型，则不要使用字面量赋值给它们，
> 因为在底层判断是否选中使用全等`===`，字面量对象每次都会创建新对象，会使判断失败。
> 例如：`v-model-true={{a: 1}}`，每次都会创建新的`{a: 1}`，全等判断失败。
> 我们应该将引用类型在组件中定义好，然后将变量赋给它们。例如：`v-model-true={self.trueValue}`，
> 在组件中定义`this.trueValue = {a: 1}`

### 多选复选框 

多选复选框，绑定的是数组 

```html
<div>
    <label><input type="checkbox" v-model="languages" value="Javascript" />Javascript</label>
    <label><input type="checkbox" v-model="languages" value="PHP" />PHP</label>
    <label><input type="checkbox" v-model="languages" value="Java" />Java</label>
    <div>你选择了：{JSON.stringify(self.get('languages'))}</div>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: function() {
        return {
            languages: [] 
        }
    }
});
```
<!-- {.example.auto} -->

> 对于多选复选框绑定数组，必须满足两个条件：
> 1. 每一个`checkbox`必须提供`value`属性，来确定选中时的值 
> 2. 必须初始化绑定的属性为数组

如果不初始化属性，或者初始化的值为非数组，则复选框将呈现出单选框的表现。

```html
<div>
    <label><input type="checkbox" v-model="languages" value="Javascript" />Javascript</label>
    <label><input type="checkbox" v-model="languages" value="PHP" />PHP</label>
    <label><input type="checkbox" v-model="languages" value="Java" />Java</label>
    <div>你选择了：{self.get('languages')}</div>
</div>
```
<!-- {.example.auto} -->

## 单选框

```html
<div>
    <label><input type="radio" v-model="language" value="Javascript" />Javascript</label>
    <label><input type="radio" v-model="language" value="PHP" />PHP</label>
    <label><input type="radio" v-model="language" value="Java" />Java</label>
    <div>你选择了：{self.get('language')}</div>
</div>
```
<!-- {.example.auto} -->

> 同复选框，单选框也必须提供`value`属性

## 单选列表

```html
<div>
    <select v-model="language">
        <option value="Javascript">Javascript</option>
        <option value="PHP">PHP</option>
        <option value="Java">Java</option>
    </select>
    <div>你选择了：{self.get('language')}</div>
</div>
```
<!-- {.example.auto} -->

## 多选列表

多选列表，绑定的是数组 

```html
<div>
    <select multiple={true} v-model="languages">
        <option v-for={['Javascript', 'PHP', 'Java']}
            value={value}
        >{value}</option>
    </select>
    <div>你选择了：{JSON.stringify(self.get('languages'))}</div>
</div>
```
<!-- {.example.auto} -->

> 不同于多选复选框需要初始化绑定属性为数组，因为`multiple`属性就可以确定是数组了 

# 绑定value

html中`value`只支持字符串，对于选择控件，Intact底层扩展了`value`属性，使其可以支持
任意类型的数据。

例如：

```html
<div>
    <input type="checkbox" v-model="checkedCheckbox" value={self.checkedValue} /> 
    <input type="radio" v-model="checkedRadio" value={self.checkedValue} /> 
    <select v-model="selected">
        <option value={self.checkedValue}>选项1</option>
        <option value={10}>选项2</option>
    </select>
    <div style="margin-top: 10px;">
        复选框绑定的值为：{JSON.stringify(self.get('checkedCheckbox'))} <br />
        单选框绑定的值为：{JSON.stringify(self.get('checkedRadio'))} <br />
        选择列表绑定的值为：{JSON.stringify(self.get('selected'))}
    </div>
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.checkedValue = {a: 1};
    }
});
```
<!-- {.example.auto} -->

# 组件双向绑定

组件的`v-model`指令是如下语法的语法糖：

```html
<Component v-model="propName" />

=>

<Component 
    value={self.get('propName')}
    ev-$change:value={function(c, value) {
        self.set('propName', value);
    }}
/>
```

所以只要组件接受`value`属性，并且当`value`改变时，触发`$change:value`事件，
就可以给该组件使用`v-model`指令进行数据的双向绑定。事实上：组件只需要支持`value`
属性即可，而`$change:value`事件是组件的默认事件，无需显式触发。

```html
<button ev-click={self.add.bind(self)}>+1</button>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: template,
    defaults: {
        value: 0
    },
    add: function() {
        this.set('value', this.get('value') + 1);
    }
});
```
<!-- {.example} -->

```html
var Component = self.Component;

<div>
    <Component v-model="count" />
    count属性值为：{self.get('count')}
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    defaults: {
        count: 0
    },
    _init: function() {
        this.Component = Component;
    }
});
```
<!-- {.example.auto} -->

甚至我们可以在子组件初始化，而父组件没有定义绑定的属性时，强制初始化父组件的属性值。
要达到这个目的，只需要在组件的`_init()`生命周期函数中，触发`$change:value`即可。

```html
<button ev-click={self.add.bind(self)}>+1</button>
```
<!-- {.example} -->

```js
var Component = Intact.extend({
    template: template,
    defaults: {
        value: 0
    },
    _init: function() {
        // 组件初始化时，如果父组件传入的绑定属性值为undefined
        // 则立即设置为默认值0，让其触发$change:value事件
        if (this.get('value') === undefined) {
            this.set('value', 0);
        }
    },
    add: function() {
        this.set('value', this.get('value') + 1);
    }
});
```
<!-- {.example} -->

```html
var Component = self.Component;

<div>
    <Component v-model="count" />
    count属性值为：{self.get('count')}
</div>
```
<!-- {.example} -->

```js
Intact.extend({
    template: template,
    _init: function() {
        this.Component = Component;
    }
});
```
<!-- {.example.auto} -->

通过上例可以看到，即使使用组件`Component`时，绑定的属性未定义，依然能将`count`初始化为0。
这在使用组件操作表单时，能提供便利性，你无需为每一个元素初始化属性值。
