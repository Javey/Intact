`class`属性值为字符串，所以我们一般这样定义该属性：

```jsx
<div class="hello vdt"></div>
```

当`class`属性值需要动态变更时，我们可以这样定义：

```jsx
<div class={"hello" + (isVdt ? ' vdt' : '')}></div>
```

采用字符串拼接的方式，看起来并不优雅。Vdt提供了一种优雅的做法，我们可以将属性值设为对象，
该对象所有取值为`true`的属性名，都会被渲染成`class`属性值

所以上例可以改成：

* <!-- {.example-template} -->
    ```jsx
    <div class={{hello: true, vdt: isVdt}}></div>
    ```
* <!-- {.example-js} -->
    ```json
    {"isVdt": 1}
    ```
<!-- {ul:.example} -->
