使用`Vdt`标签语法，你无法定义一个可变标签，即：根据传入的参数不同，既可以渲染成`<a></a>`，又可以渲染成`<b></b>`

但模板中，用于创建标签的方法`h()`，可以做到这一点

### `h(tagName[, attrs, children, className, key, ref])`

* @description 创建虚拟DOM
* @param tagName `{String}` 标签名
* @param attrs `{Object}` 属性 
* @param children `{String | Number | vNode | Array<String | Number | vNode>}` 子元素
* @param className `{String}` class属性
* @param key `{String}` key属性
* @param ref `{Function}` 用于引用到元素


该函数创建一个虚拟DOM。下例展示如何通过它创建`<a>`：

* <!-- {.example-template} -->
    ```jsx
    h('a', {href: '//www.baidu.com'}, ['百度官网']);
    ```
<!-- {ul:.example} -->

有了它我们就可以创建可变标签了

* <!-- {.example-template} -->
    ```jsx
    var Button = function(attrs) {
        return h(attrs.tagName || 'button', attrs.properties, attrs.children);
    }
    <div>
        <Button tagName="a" properties={{href: '//www.baidu.com'}}>a标签按钮</Button>
        <Button tagName="button">button标签按钮</Button>
    </div>
    ```
<!-- {ul:.example} -->
