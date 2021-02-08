import {h} from '../src';
import {VNode} from '../src/vnode';
import assert from 'assert';

describe('VNode', () => {
    it('normalize children', () => {
        const vNodes = [
            h('i', {key: 'a'}),
            h('i', {key: 'b'}),
            h('i')
        ];
        const vNode1 = h('span', null, vNodes);
        const vNode2 = h('i', null, [
            h('i'), 
            vNodes,
            h('i')
        ]);
        const arr = ['.$0', 'a', 'b', '.$1', '.$2'];
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            const index = i;
            assert.strictEqual(vNode2.children[index].key === item, true);
        }
    });

    it('normalize children for FunctionComponent', () => {
        const vNodes = [
            h('i', {key: 'a'}),
            h('i', {key: 'b'}),
            [
                h('i'),
                'test',
                1
            ]
        ];
        function Component(props) {
            assert.strictEqual(props.children.length, 5);
            for (let i = 0; i < props.children.length; i++) {
                const item = props.children[i];
                assert.strictEqual(item instanceof VNode, true);
            }
        }

        h(Component, {children: vNodes});
    });

    it('should clone the reused vNode which is used as the only child element', () => {
        const vNode = h('div');
        const div = h('div', null, [h('div', null, vNode), h('div', null, vNode)]);

        assert.strictEqual(div.children[0].children !== div.children[1].children, true);
    });
});
