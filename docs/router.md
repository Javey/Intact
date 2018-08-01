Intact没有实现路由功能，因为没必要，开源的第三方路由库功能都非常强大，本节只是说明怎么将它们与
Intact结合使用。

# 简单的路由

不管是借助第三方库，还是自己实现简单的路由，都需要先定义一个组件充当管理者，去动态渲染不同的页
面组件，而且为了管理方便，这里的组件可以使用实例组件来代替。

```js
var PageA = Intact.extend({template: '<div>pageA</div>'});
var PageB = Intact.extend({template: '<div>pageB</div>'});

var routes = {
    '/page/a': PageA,
    '/page/b': PageB
};

var App = Intact.extend({
    template: '<div>{self.get("view")}</div>',
    defaults: function() {
        return {
            view: null
        }
    },
    load: function(Page) {
        var page = new Page();
        this.set('view', page);
    }
});

var app = Intact.mount(App, document.getElementById('app'));

// 这里使用hash路由
window.addEventListener('hashchange', function() {
    app.load(routes[location.hash.substr(1)]);
});
// 初始化hash
location.hash = '#/page/a';
```

> 如果你熟悉`template`模板函数的使用，你也可以使用类组件实现

# 与第三方库结合

下面以[director][1]为例，介绍怎么实现与第三方路由库的整合。

针对上面的简单路由使用方式，我们需要更改路由配置`routes`，并且无需自己绑定`hashchange`事件，
另外director支持路由参数，所以我们扩展`App`组件的`load()`方法，让它实例化时可以传入数据。

```js
var Index = Intact.extend({template: '<div>Index</div'});
var User = Intact.extend({template: '<div>userId: {self.get("userId")}</div>'});

var App = Intact.extend({
    template: '<div>{self.get("view")}</div>',
    defaults: function() {
        return {
            view: null
        }
    },
    load: function(Page, data) {
        var page = new Page(data);
        this.set('view', page);
    }
});

var app = Intact.mount(App, document.getElementById('app'));

var router = Router({
    '/': function() {
        app.load(Index);
    },
    '/user/:userId': function(userId) {
        app.load(User, {userId: userId});
    }
}).configure({
    notfound: function() {
        router.setRoute('/');
    }
});
router.init('/');
```

可以看到，不管是简单路由还是和第三方路由库整合，都相当简单，而且借助Intact强大的继承功能，你
无需定义嵌套路由，就能实现复杂的路由逻辑。

# 按需加载页面

上面的例子都是提前定义各个页面的页面组件，如：`Index`，`User`。这在规模较小的项目中没什么问题，
但当页面很多时，提前定义每个页面的页面组件，会使单文件体积过大，影响首次渲染速度。这时，按需加载各个
页面组件变得很迫切。利用`webpack`或者`requireJs`等工具可以很方便地实现页面根据路由按需加载。

我们只需要将上例中的路由配置`routes`更改为（假设文件放在`pages`目录下）：

```js
var router = Router({
    '/': function() {
        // 按需加载页面组件
        require(['pages/index'], function(Page) {
            app.load(Page);
        });
    },
    '/user/:userId': function(userId) {
        require(['pages/user'], function(Page) {
            app.load(Page, {userId: userId});
        });
    }
}).configure({
    notfound: function() {
        router.setRoute('/');
    }
});
```

[1]: https://github.com/flatiron/director
