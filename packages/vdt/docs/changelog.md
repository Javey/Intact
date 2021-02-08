# v1.3.0

1. add: 对于组件可以双向绑定任意属性，而非仅仅只是`value`属性 [Javey/Intact#7](https://github.com/Javey/Intact/issues/7)
2. add: 更详细的报错信息，可以标示出具体的错误位置 [#9](https://github.com/Javey/vdt.js/issues/9) 
3. add: 支持同一事件绑定多次回调函数，可以在`v-model`占用了事件属性后，再次绑定该事件属性，详见[双向绑定(v-model)](https://javey.github.io/vdt.html#/documents/model) [Javey/Intact#9](https://github.com/Javey/Intact/issues/9) 
4. add: 新增虚拟标签`template`用于包裹多个元素，`template`只会渲染子元素，自身不会被渲染，详见[模板语法 template](https://javey.github.io/vdt.html#/documents/template) [#10](https://github.com/Javey/vdt.js/issues/10)
5. add: 支持带参数的`block`，详见[模板继承 带参数的block](https://javey.github.io/vdt.html#/documents/extend) [#8](https://github.com/Javey/vdt.js/issues/8)
6. add: 模板编译后的代码进行了美化，方便调试

7. change: 现在`skipWhitespace`也会去掉标签和插值分隔符之间的空白字符 [#11](https://github.com/Javey/vdt.js/issues/11)


# v1.2.0

1. add: 支持模板返回`undefined`
2. add: `block`名称支持连字符`-`
3. add: `block`支持`v-if`指令 
4. add: 支持传递上下文`context`给组件
5. add: 组件支持`block`传递代码片段
6. add: 使用`<t:parent>`继承模板时，可以直接书写子元素，该元素会当做`scope.chilren`传给parent
7. add: 支持使用字符串当做`ref`值

4. fix: 修复组件使用`block`一旦渲染，不能被替换掉的问题
5. fix: 修复使用es6`...props`语法，编译报错的问题

# v1.1.0

1. add: 支持渲染svg
2. add: 支持es6对象析构语法`...props`
3. add: 模板继承语法`<t:parent>`支持指令`v-if` `v-for`
4. add: 属性名支持点号`.`
5. add: 当组件存在继承时，可以通过`parent`直接继承父组件的模板，无需显式引入

# v1.0

1. add: 支持`v-raw`指令，用于后端渲染时，输出原始内容
2. add: 支持`v-model`指令，用于表单元素数据双向绑定
3. add: 新增`hydrate`方法，支持前后端同构
4. add: 支持`skipWhitespace`配置，用于去掉空白字符
3. change: 虚拟dom引擎改用`misstime`取代`virtual-dom`，大幅提高性能
