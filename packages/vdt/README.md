# Vdt.js

[![npm version](https://badge.fury.io/js/vdt.svg)](https://badge.fury.io/js/vdt)
[![Build Status](https://travis-ci.org/Javey/vdt.js.svg?branch=master)](https://travis-ci.org/Javey/vdt.js)

一个基于虚拟DOM的模板引擎，详情请访问：[Documents](http://javey.github.io/vdt.html)

![Benchmark](/assets/benchmark-update.png 'Benchmark')

## 功能特性

* 基于虚拟DOM，更新速度快
* 支持模板继承，包含，宏定义等功能
* 文件大小在gzip压缩后大概13KB（包含浏览器实时编译模块）
* 支持前后端渲染

## 安装

```shell
npm install vdt --save
```

## 示例

```jsx
<div>
    <h1>{title}</h1>
    <div ev-click={onClick.bind(self)}>Clicked: {count}</div>
    <ul v-for={items}>
        <li>{key}: {value}</li>
    </ul>
</div>
```

```js
var vdt = Vdt(template);
var dom = vdt.render({
    title: 'vdt',
    items: {
        a: 1,
        b: 2
    },
    count: 0,

    onClick: function() {
        this.count++;
        vdt.update();
    }
});

document.body.appendChild(dom);
```

## 相关库

1. [misstime](https://github.com/Javey/misstime) vdt基于的virtual dom库
2. [Intact](http://javey.github.io/intact/) 基于vdt的mvvm框架
3. [vdt-loader](https://github.com/Javey/vdt-loader) vdt模板文件的webpack loader

## 基准测试 

See [Benchmark](http://javey.github.io/vdt.html#/benchmark)

## 许可

MIT
