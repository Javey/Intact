import Intact from './constructor';

Intact.prototype.hydrate = function(vNode, dom) {
    const vdt = this.vdt;
    if (!this.inited) {
        this.one('$inited', () => {
            const element = this.hydrate(vNode, dom);
            if (dom !== element) {
                vNode.dom = element;
            }
            this._triggerMountedQueue();
            this.mount(null, vNode);
        });

        return dom;
    }

    this._startRender = true;
    this.element = vdt.hydrate(
        this, dom, this.mountedQueue, 
        this.parentDom, vNode, this.isSVG,
        this.get('_blocks')
    );
    this.rendered = true;
    this.trigger('$rendered', this);
    this._create(null, vNode);

    return this.element;
};

Intact.prototype.toString = function() {
    return this.vdt.renderString(this, this.get('_blocks')); 
};
