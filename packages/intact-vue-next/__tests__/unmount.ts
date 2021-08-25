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
import {h as v, ComponentPublicInstance, render as vueRender} from 'vue';
import Normalize from './normalize.vue';

describe('Intact Vue Next', () => {
    describe('Unmount', () => {
        it('should unmount functional component correctly which returns multiple vNodes that nests Intact component', async () => {
            const Test = Component.functionalWrapper(function(props: any) {
                const [element1, element2] = props.children;
                return [
                    h(ChildrenIntactComponent, null, element1),
                    h(ChildrenIntactComponent, null, element2)
                ];
            });
            render(`
                <ChildrenIntactComponent>
                    <Test>
                        <a>1</a>
                        <b>2</b>
                    </Test>
                </ChildrenIntactComponent>
            `, {Test, ChildrenIntactComponent});

            await nextTick();
            const container = vm.$el.parentNode;
            vueRender(null, container);
            expect(container.childNodes.length).to.eql(0);
        });
    });
});
