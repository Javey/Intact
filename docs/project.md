> 阅读本小节，你需要先了解[webpack][2]。

前面我们提到了 __业务逻辑__ 与 __视图逻辑__ 的分离，是为了解决JS逻辑过分膨胀的问题。通过前面的
例子我们发现一个不够优雅的地方，那就是模板中使用的组件必须在组件逻辑中注入。其实模板要使用什么组件
跟组件的逻辑没有一点关系，秉着业务逻辑与视图逻辑分离的原则，我们应该将组件的注入移入模板。

利用webpack可以很方便地做到。首先你需要安装以下编译工具

```bash
npm install webpack babel-core babel-loader \
    babel-preset-env \
    vdt vdt-loader --save-dev
```


# `vdt-loader`

[vdt-loader][1]用于将Vdt模板编译成模板函数，webpack配置如下：

```js
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.vdt$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env'],
                        }
                    },
                    {
                        loader: 'vdt-loader',
                        options: {
                            // 去掉with语法
                            noWith: true,
                        }
                    }
                ]
            }
        ]
    }
    ...
};
```

如果你在模板中使用es6/7语法，还可以结合使用`babel-loader`进行编译。

# 模板文件

有了vdt-loader，我们可以将vdt定义成单独的文件，并在模板中引入所需的组件。
例如：`user.vdt`定义如下：

```js
// @file user.vdt
// 可以直接使用import引入模板所需依赖
import Button from './components/buttton';
import Menu from './components/menu';

<div>
    <Button>按钮</Button>
    <Menu />
</div>
```

然后`user.js`文件中引入模板文件：

```js
// @file user.js
import template from './user.vdt';

export defaults extends Intact {
    get template() { return template; }
}
```

除了在模板中引入组件外，你还可以引入另一个模板，例如，在继承`layout.vdt`时：

```html
import layout from './layout.vdt';

<t:layout>
    <b:content>content</b:content>
</t:layout>
```

# CSS文件

css文件，可以通过`css-loader & style-loader`引入，如果你需要可编译css工具，例如：stylus，还可以
使用`stylus-loader`。首先安装它们。

```shell
npm install css-loader style-loader stylus-loader --save-dev
```

然后加入以下配置：

```js
module.exports = {
    ...
    module: {
        rules: [
            ...
            {
                test: /\.(styl|css)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'stylus-loader',
                        options: {
                            'include css': true
                        }
                    },
                ]
            }
        ]
    }
    ...
};
```

在组件逻辑文件`user.js`中引入样式文件，假设为`user.styl`：

```js
import template from './user.vdt';
import css from './user.styl';

...

```

你甚至可以在模板文件中引入样式文件，这对于纯模板组件很有用，例如：`layout.vdt`需要定义全局样
式，假设样式文件为`layout.styl`：

```html
// @file layout.vdt
import './layout.styl';

<div>
    <b:content />
</div>
```


[1]: https://github.com/Javey/vdt-loader
[2]: https://webpack.js.org/
