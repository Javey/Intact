# IntactReact

> - 在react 项目中运行intact组件
> - 本项目测试用例使用`react 16`


### 使用方式

1. 引入对应的intact库,intact 组件
2. 设置Intact 实例别名到IntactReact , 以下为webpack 示例

```js
resolve: {
    alias: {
        'intact$': 'intact-react'
    }
}
```
```js
import Intact from 'intact';
import React from 'react'
import ReactDOM from 'react-dom'
const h = React.createElement;

class I extends Intact {
    @Intact.template()
    static template = `<div ev-click={self.onClick}>{self.get("children")} child default content {self.get("count")}!</div>`

    onClick(e) {
        const count = this.get('count');
        this.set('count', count + 1);
    }

    defaults() {
        return {
            count: 1
        };
    }
}

class R extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 1
        };
    }

    componentDidMount() {
        console.log(this, 'react componentDidMount')
    }

    click() {
        this.setState({
            count: this.state.count + 1
        })
    }

    render() {
        return h('div', {
            id: 'react',
            onClick: this.click.bind(this)
        }, ['wrap', h(I,{},'this is intact children'), `${this.state.count}`])
    }
}

const container = document.createElement('div');
document.body.appendChild(container);
const component = h(R,{});
ReactDOM.render(
    component,
    container
);
```


### 注意

- `intact` 对应的 `$change:value` 使用react props `on$change-value`,对应的 `$changed:value` 使用 react props `on$changed-value` , `$change`==>`on$change`  `$changed`==>`on$changed`
- 不支持`ReactDOMServer` , 不支持`ReactDOM.hydrate`
- react 添加 block 支持, 例如：`<b:block></b:block>`对应为React属性`b-block`, `<b:block params="a">`对应为React属性`b-block={(a) => {}}`
