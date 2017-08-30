<p align="center">
    <a href="https://saucelabs.com/u/Intactjs">
        <img src="https://saucelabs.com/buildstatus/Intactjs?saucy" alt="Build Status">
    </a>
    <br />
    <a href="https://saucelabs.com/u/Intactjs">
        <img src="https://saucelabs.com/browser-matrix/Intactjs.svg" alt="Browser Matrix">
    </a> 
</p>

# Intact

[文档 Documents](http://javey.github.io/intact/#/document/start)

## 简介

Intact是一个数据驱动构建用户界面的前端框架。设计的初衷是为了解决现有框架中在构建单页面应用时，
必须依靠嵌套路由来实现复杂的页面结构的问题。组件继承 是该框架最大的特色，同时强大的组件异步渲
染机制，极大地提高了组件的灵活性。

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
