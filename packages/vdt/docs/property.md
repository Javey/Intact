在使用Vdt的过程中，你也许会遇到这样一个问题：设置的属性，并不能渲染出来，例如：

* <!-- {.example-template} -->
    ```jsx
    <input maxlength="10" />
    ```
<!-- {ul:.example} -->

上述例子中，设置的`maxlength`属性丢失了。要理解这个原因，可以看看这段介绍
[Content attribute & IDL attribute](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes#Content_versus_IDL_attributes)，
以及Virtual-Dom文档中对[VNode](https://github.com/Matt-Esch/virtual-dom/blob/master/docs/vnode.md)的介绍

## Content vs IDL attribute

Content attribute为小写风格`lowercase`，通过`element.setAttribute() & element.getAttribute()`
方法来设置&获取属性；

IDL attribute为驼峰风格`lowerCamlCase`，
你可以像读取javascript对象一样来设置&获取属性，例如：`element.foo`

在Vdt中，使用的都是IDL attribute，而上述例子中，`maxlength`为Content attribute，
所以并不会渲染到html中，但是你可以这样访问该属性: `element.maxlength === '10'`;

`maxlength`对应的IDL attribute为：`maxLength`，所以我们可以这样设置该属性

* <!-- {.example-template} -->
    ```jsx
    <input maxLength="10" />
    ```
<!-- {ul:.example} -->

关于IDL attribute可以查看[Web API](https://developer.mozilla.org/en-US/docs/Web/API)
[HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement)

不过你也不用担心这么多属性怎么去查，__基本上只需要将属性名从`lowercase`改成`lowerCamlCase`即可__

### class & for

`class`和`for`这两个属性对应的IDL attribute分别为`className`和`htmlFor`，由于它们比较常见，
Vdt在内部已经自动将它们转换了，所以这两种属性写法都是合法的。

## attributes属性

HTML所有元素都具有`attributes`属性，通过它设置的所有属性都会当做Content attribute，参见：[attributes][1]

因此通过`attributes`属性我们可以设置任意的自定义属性，例如：

* <!-- {.example-template} -->
    ```jsx
    <input attributes={{maxlength: 10, hello: 'vdt', 'data-a': 'b'}} />
    ```
<!-- {ul:.example} -->

## Boolean属性值

对于值为`Boolean`类型的属性，只接受`Boolean`类型的值，而且不能省略

* `"true"`和`"false"`这样的字符串会被当做`true`处理
* 省略属性值，并不会将html中属性值设为`true`，而是会当做`false`处理
* 不能用`attributes`属性来设置`Boolean`值，因为所有`attributes`对象里的值，会转成`String`类型

例如下面这样设置是达不到目的的：

* <!-- {.example-template} -->
    ```jsx
    <div>
        <input readOnly="false" value="设为false也不能写"/>
        <input readOnly value="等于没设，可以读写"/>
        <input attributes={{readonly: false}} value="设为false也不能写"/>
    </div>
    ```
<!-- {ul:.example.dom} -->

正确的做法：

* <!-- {.example-template} -->
    ```jsx
    <div>
        <input readOnly={false} value="设为false，正常读写"/>
        <input readOnly={true} value="设为true，只读"/>
    </div>
    ```
<!-- {ul:.example.dom} -->



[1]: https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
