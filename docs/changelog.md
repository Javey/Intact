## v2.2.0

1. `Add` 新增`$receive`事件，在组件接收到变更后的新属性时触发
2. `Add` 异步组件返回的`Promise`在`rejected`的情况下，即使没有处理，也会完成初始化 [#2](2)
3. `Add` `Animate`组件新增`delayDestroy`属性，当为`true`时，组件会在动画完成后才销毁，否则立即销毁，默认为`true`
4. `Add` 支持模板返回`undefined`，这将会被渲染成注释节点
5. `Add` 模板支持类的静态属性定义方式，便于在`class`中声明模板
6. `Add` `<b:block>`语法现在能够支持给组件传递子模板
7. `Add` `ref`属性支持字符串`String`类型的定义方式
8. `Add` 现在组件所有的方法都会自动`bind(this)`，所以无需在模板中再次`bind`
8. `Fix` 修复css进入动画某些情况下在firefox无法触发的问题 [#5](1)
9. `Fix` 修复`Animate`组件变更`transition`属性不能立即生效的问题
10. `Fix` 修复组件更新过程中又触发更新，`children`属性不更新的问题
11. `Fix` 修复某些情况下组件没有被销毁(destroy)的问题
12. `Fix` 修复当组件的某个属性没有传递时，组件更新会将这样的属性统统设为`undefined`的问题，现在都会设为组件定义的默认值

## v2.1.0

1. `Add` 新增`$destroyed`事件，组件销毁时触发

[1]: https://github.com/Javey/Intact/issues/5 
[2]: https://github.com/Javey/Intact/issues/2
