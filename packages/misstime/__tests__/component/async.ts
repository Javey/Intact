import {Component} from '../../src/core/component';
import {render} from '../../src/core/render';
import {createVNode as h, VNode as VNodeConstructor} from '../../src/core/vnode';
import {Fragment, findDomFromVNode} from '../../src/utils/common';
import {VNode, VNodeComponentClass, Template} from '../../src/utils/types';
import {wait} from '../utils';

describe('Component', () => {
    let container: Element;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        render(null, container);
        document.body.removeChild(container);
    });

    class Test extends Component<{name?: number}> {
        static template(this: Test) {
            expect(this.get('name')).to.exist;
            return h('div', null, this.get('name'));
        }

        init() {
            return new Promise(resolve => {
                setTimeout(resolve, 100);
            }).then(() => {
                this.set('name', 1);
            });
        }
    }

    describe('Async Component', () => {
        describe('Mount', () => {
            it('should mount async component', async () => {
                render(h(Test), container);
                expect(container.innerHTML).to.equal('<!--async-->');

                await wait(200);
                expect(container.innerHTML).to.equal('<div>1</div>');
            });

            it('should trigger event correctly', async () => {
                const onChangeName = sinon.spy();
                const onChangedName = sinon.spy(() => {
                    expect(container.innerHTML).to.equal('<div>1</div>');
                });
                class MyTest extends Test {
                    init() {
                        this.on('$change:name', onChangeName);
                        this.on('$changed:name', onChangedName);
                        return super.init();
                    }
                }

                render(h(MyTest), container);
                await wait(200);
                expect(onChangeName).to.have.been.calledOnceWith(1, undefined);
                expect(onChangedName).to.have.been.calledOnceWith(1, undefined);
            });

            it('should call beforeMount and mounted correctly', async () => {
                const beforeMount = sinon.spy();
                const mounted = sinon.spy();

                class MyTest extends Test {
                    beforeMount() {
                        beforeMount();
                    }

                    mounted() {
                        mounted();
                    }
                }

                render(h(MyTest), container);
                expect(beforeMount).to.have.callCount(0);
                expect(mounted).to.have.callCount(0);

                await wait(200);
                expect(beforeMount).to.have.callCount(1);
                expect(mounted).to.have.callCount(1);
            });

            it('should mount even if it has thrown error', async () => {
                class ErrorComponent extends Component {
                    static template() {
                        return h('div') 
                    }

                    init() {
                        return Promise.reject('some reason');
                    }
                }

                render(h(ErrorComponent), container);
                await wait(0)
                expect(container.innerHTML).to.equal('<div></div>');
            });
        });

        describe('Update', () => {
            it('should update correctly', async () => {
                render(h(Test), container);
                render(h(Test, {name: 2}), container);

                expect(container.innerHTML).to.equal('<!--async-->');

                await wait(200);
                expect(container.innerHTML).to.equal('<div>2</div>');
            });

            it('should trigger events correctly', async () => {
                const onReceiveName = sinon.spy(() => {
                    expect(container.innerHTML).to.equal('<div>1</div>');
                });
                class MyTest extends Test {
                    init() {
                        this.on('$receive:name', onReceiveName);
                        return super.init();
                    }
                }

                render(h(MyTest), container);
                render(h(MyTest, {name: 2}), container);

                await wait(200);
                expect(onReceiveName).to.have.been.calledOnceWith(2, undefined);
            });

            it('should call beforeUpdate and updated correctly', async () => {
                const beforeUpdate = sinon.spy();
                const updated = sinon.spy();

                class MyTest extends Test {
                    beforeUpdate() {
                        beforeUpdate();
                    }

                    updated() {
                        updated();
                    }
                }

                render(h(MyTest), container);
                render(h(MyTest), container);
                expect(beforeUpdate).to.have.callCount(0);
                expect(updated).to.have.callCount(0);

                await wait(200);
                expect(beforeUpdate).to.have.callCount(1);
                expect(updated).to.have.callCount(1);
            });
        });
    });
});
