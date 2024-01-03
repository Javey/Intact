import {Component} from '../src';
import {
    dispatchEvent,
    createIntactComponent,
    SimpleIntactComponent,
    ChildrenIntactComponent,
    PropsIntactComponent,
    WrapperComponent,
    vm,
    render,
    reset,
    nextTick,
} from './helpers';
import {createVNode as h, ComponentFunction} from 'intact';

describe('Intact Vue Legacy', () => {
    describe('Unmount', () => {
        it('should unmount vnode that rendered by intact', async () => {
            render(`<Main><Layout class="layout" ref="layout"><A  v-if="show" /></Layout></Main>`, {
                Main: {
                    template: `<div class="main"><slot /></div>`,
                },
                Layout: ChildrenIntactComponent,
                A: {
                    template: `<div class="a">a</div>`
                },
            }, { show: true });

            vm.$refs.layout.forceUpdate();
            await nextTick();
            vm.show = false;
            await nextTick();
            expect(vm.$el.innerHTML).to.eql('<div class="layout"></div>');
        });

        it('should unmount functional component correctly which returns multiple vNodes that nests Intact component', async () => {
            const Test = Component.functionalWrapper(function(props: any) {
                const [element1, element2] = props.children;
                return [
                    h(ChildrenIntactComponent, null, element1),
                    h(ChildrenIntactComponent, null, element2)
                ];
            });
            render(`
                <div>
                    <ChildrenIntactComponent v-if="show">
                        <Test><a>1</a><b>2</b></Test>
                    </ChildrenIntactComponent>
                </div>
            `, {Test, ChildrenIntactComponent}, {
                show: true,
            });

            const container = vm.$el.parentNode;
            expect(vm.$el.innerHTML).to.eql('<div><div><a>1</a></div><div><b>2</b></div></div>');

            vm.show = false;
            await nextTick();
            expect(vm.$el.innerHTML).to.eql('<!---->');
        });
    });
});
