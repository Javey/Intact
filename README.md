<p align="center">
    <a href="https://travis-ci.org/Javey/Intact.svg?branch=master">
        <img src="https://travis-ci.org/Javey/Intact.svg?branch=master" alt="Build Status">
    </a>
    <br />
    <a href="https://saucelabs.com/u/Intactjs">
        <img src="https://saucelabs.com/browser-matrix/Intactjs.svg" alt="Browser Matrix">
    </a> 
</p>

# Intact

[文档 Documents](http://javey.github.io/intact/#/document/start)

## 简介

Intact作为一个可继承，并且拥有强逻辑模板的前端MVVM框架，有着如下特色：

1. 充分利用组合与继承的思想，来最高限度地复用代码
2. 同时支持数据驱动和组件实例化调用，来最便捷地实现功能
3. 强逻辑模板，赋予模板更多功能和职责，来完成业务逻辑和表现逻辑分离

## 安装

### 通过script标签引入

请通过`npm`、`bower`或者直接到github上下载源码包。其中
[`dist/intact.js`](https://raw.githubusercontent.com/Javey/Intact/master/dist/intact.js)
为UMD方式打包的文件，直接通过script引入会暴露全局变量`Intact`。

```html
<script src="/path/to/intact.js"></script>

<!-- 或者通过cdn -->
<script src="//unpkg.com/intact"></script>
```

### NPM

在大型项目中，一般都会使用webpack构建，通过npm包管理器来管理项目依赖。

```bash
npm install intact --save
```

## 使用

```js
var App = Intact.extend({
    defaults: {
        name: 'Intact'
    },
    template: '<div>Hello {self.get("name")}!</div>'
});
```

通过`Intact.mount`方法，可以将该组件挂载到指定元素下。

```js
window.app = Intact.mount(App, document.getElementById('app'));
```
## 许可

MIT
