## 事件绑定

通过`ev-*`属性，可以在dom上绑定事件

例如：

* <!-- {.example-template} -->
    ```jsx
    <button ev-click={function() { alert('点击了按钮') }}>点击按钮</button>
    ```
<!-- {ul:.example.dom} -->

## 绑定方法

大多数情况下，事件处理函数都比较复杂，直接写在模板中不太优雅。
一般通过将事件处理传入模板的`render`方法，来进行绑定

例如：

* <!-- {.example-template} -->
    ```jsx
    <button ev-click={onClick.bind(self)}>点击了{count}次</button>
    ```
* <!-- {.example-js} -->
    ```js
    var vdt = Vdt(template);
    vdt.render({
        count: 0,
        onClick: function() {
            this.count++;
            // 调用update方法去更新dom
            vdt.update();
        }
    })
    ```
<!-- {ul:.example.dom} -->

__事件处理函数中`this`默认指向`window`，我们可以`bind(self)`让它指向渲染到模板的数据`__

## 传入参数 

你可以通过`bind()`方法，向事件处理函数中传入参数

* <!-- {.example-template} -->
    ```jsx
    <div>
        点击下面的名字
        <ul>
            <li v-for={users} 
                ev-click={onClick.bind(self, value)}
            >{value}</li>
        </ul>
    </div>
    ```
* <!-- {.example-js} -->
    ```js
    var vdt = Vdt(template);
    vdt.render({
        users: ['Syalvia', 'Shadow', 'Javey'],
        onClick: function(user) {
            alert('你点击的是' + user);
        }
    })
    ```
<!-- {ul:.example.dom} -->

## 事件对象

事件处理函数的最后一个参数为事件对象，通过它我们可以访问事件的属性和方法 

* <!-- {.example-template} -->
    ```jsx
    <div ev-click={onClickParent.bind(self)}>
        点击父元素
        <p ev-click={onClickChild.bind(self)}>点击子元素</p>
    </div>
    ```
* <!-- {.example-js} -->
    ```js
    var vdt = Vdt(template);
    vdt.render({
        onClickParent: function(event) {
            alert('你点击的是父元素，target: ' + event.target.tagName);
        },
        onClickChild: function(event) {
            alert('你点击的是子元素，target: ' + event.target.tagName);
        }
    })
    ```
<!-- {ul:.example.dom.event-object} -->

我们可以通过`event.stopPropagation()`来阻止冒泡，

* <!-- {.example-template} -->
    ```jsx
    <div ev-click={onClickParent.bind(self)}>
        点击父元素
        <p ev-click={onClickChild.bind(self)}>点击子元素</p>
    </div>
    ```
* <!-- {.example-js} -->
    ```js
    var vdt = Vdt(template);
    vdt.render({
        onClickParent: function(event) {
            alert('你点击的是父元素，target: ' + event.target.tagName);
        },
        onClickChild: function(event) {
            // 让事件冒泡
            event.stopPropagation();
            alert('你点击的是子元素，target: ' + event.target.tagName);
        }
    })
    ```
<!-- {ul:.example.dom.event-object} -->

