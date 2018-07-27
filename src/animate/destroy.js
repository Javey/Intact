import prototype from './prototype';

prototype.destroy = function(lastVNode, nextVNode, parentDom) {
    // 1: 不存在parentDom，有两种情况：
    //      1): 父元素也要被销毁，此时: !parentDom && lastVNode && !nextVNode
    //      2): 该元素将被替换，此时：!parentDom && lastVNode && nextVNode
    //      对于1)，既然父元素要销毁，那本身也要直接销毁
    //      对于2)，本身必须待动画结束方能销毁
    // 2: 如果该元素已经动画完成，直接销毁
    // 3: 如果直接调用destroy方法，则直接销毁，此时：!lastVNode && !nextVNode && !parentDom
    // 4: 如果不是延迟destroy子元素，则立即销毁
    if (!this.get('a:delayDestroy') ||
        !parentDom && !nextVNode && this.parentVNode.dom !== this.element ||
        // this.get('a:disabled') || 
        this._leaving === false
    ) {
        this._super(lastVNode, nextVNode, parentDom);
    }
};
