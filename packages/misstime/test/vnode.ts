import {createElementVNode} from '../src/vnode';
import {Types, ChildrenTypes, VNode}  from '../src/types';

describe('VNode', () => {
    it('should throw error if we createVNode for Component', () => {
        expect(() => createElementVNode(Types.ComponentFunction, '', ChildrenTypes.HasInvalidChildren)).toThrowError();
    });

    it('should create element vNode', () => {
        const props = {name: 1};
        const ref = (i: Element | null) => {};
        const vNode = createElementVNode(
            Types.CommonElement,
            'div', 
            null,
            null,
            'class-name',
            props,
            'key',
            ref
        );

        expect(vNode.type).toEqual(Types.CommonElement);
        expect(vNode.tag).toEqual('div');
        expect(vNode.childrenType).toEqual(ChildrenTypes.HasInvalidChildren);
        expect(vNode.children).toEqual(null);
        expect(vNode.className).toEqual('class-name');
        expect(vNode.props).toEqual(props);
        expect(vNode.key).toEqual('key');
        expect(vNode.ref).toEqual(ref);
    });

    it('should validate children', () => {
        expect(() => {
            createElementVNode(Types.CommonElement, 'input', 'test', ChildrenTypes.UnknownChildren);
        }).toThrowError(`Intact Error: input elements can't have children.`);
    });

    describe('Normalize Children', () => {
        function normalize(children: any) {
            return createElementVNode(
                Types.CommonElement,
                'div',
                children,
                ChildrenTypes.UnknownChildren,
            );
        }

        function createTestVNodeWithKey() {
            return createElementVNode(
                Types.CommonElement,
                'i',
                null,
                ChildrenTypes.HasInvalidChildren,
                null,
                null,
                'key',
            );
        }

        it('should normalize children', () => {
            const vNode = normalize(
                [
                    createElementVNode(Types.CommonElement, 'span'),
                    createElementVNode(Types.CommonElement, 'i'),
                    ['text'],
                    [createElementVNode(Types.CommonElement, 'b')],
                    1
                ]
            );

            expect((vNode.children as VNode[]).map(vNode => vNode.key)).toEqual(['$0', '$1', '$2', '$3', '$4']);
            expect(vNode.childrenType & ChildrenTypes.HasKeyedChildren).toBeGreaterThan(0);
        });

        it('should normalize invalid children', () => {
            const vNode = normalize(false);

            expect(vNode.children as any).toBe(false);
            expect(vNode.childrenType).toBe(ChildrenTypes.HasInvalidChildren);
        });

        it('should normalize string children', () => {
            const vNode = normalize('1');

            expect(vNode.children).toBe('1');
            expect(vNode.childrenType).toBe(ChildrenTypes.HasTextChildren);
        });

        it('should normalize number children', () => {
            const vNode = normalize(1);

            expect(vNode.children).toBe(1);
            expect(vNode.childrenType).toBe(ChildrenTypes.HasTextChildren);
        });

        it('should normalize children with invalid vNode', () => {
            const vNode = normalize([null, createElementVNode(Types.CommonElement, 'span')]);

            expect((vNode.children as VNode[]).map(vNode => vNode.key)).toEqual(['$1']);
        });

        it('should normalize children with string vNode', () => {
            const vNode = normalize([
                'string',
                createElementVNode(Types.CommonElement, 'span')
            ]);

            expect((vNode.children as VNode[]).map(vNode => vNode.key)).toEqual(['$0', '$1']);
        });

        it('should normalize children that all vNodes are invalid', () => {
            const vNode = normalize([null, true]);

            expect(vNode.children as VNode[]).toEqual([]);
            expect(vNode.childrenType).toBe(ChildrenTypes.HasInvalidChildren);
        });

        it('should normalize children that are empty array', () => {
            const vNode = normalize([]);

            expect(vNode.children as VNode[]).toEqual([]);
            expect(vNode.childrenType).toBe(ChildrenTypes.HasInvalidChildren);
        });

        it('should normalize children that is a vNode', () => {
            const vNode = normalize(createElementVNode(Types.CommonElement, 'span'));

            expect((vNode.children as VNode).tag).toBe('span');
            expect(vNode.childrenType).toBe(ChildrenTypes.HasVNodeChildren);
        });

        it('should normalize children that have been normalized', () => {
            const children = createElementVNode(Types.CommonElement, 'span');
            const vNode1 = normalize(children);
            const vNode2 = normalize(children);

            expect(vNode1.children === vNode2.children).toBe(false);
        });

        it('should normalize children that contains normalized vNode', () => {
            const child = createElementVNode(Types.CommonElement, 'span');
            const vNode1 = normalize([child, createTestVNodeWithKey()]);
            const vNode2 = normalize([createTestVNodeWithKey(), child]);

            const children1 = vNode1.children as VNode[];
            const children2 = vNode2.children as VNode[];
            expect(children1[0] === children2[1]).toBe(false);
            expect(children1.map(vNode => vNode.key)).toEqual(['$0', 'key']);
            expect(children2.map(vNode => vNode.key)).toEqual(['key', '$1']);
        });

        it('should normalize children that contains normalized vNode in nested array', () => {
            const child = createElementVNode(Types.CommonElement, 'span');
            const childWithKey = createTestVNodeWithKey();
            const vNode1 = normalize([child, childWithKey]);
            const vNode2 = normalize([[child, childWithKey]]);
            const vNode3 = normalize([[[child, childWithKey]]]);

            [vNode1, vNode2, vNode3].forEach(vNode => {
                expect((vNode.children as VNode[]).map(vNode => vNode.key)).toEqual(['$0', 'key']);
            });
        });

        it('should throw error if has invalid child', () => {
            expect(() => normalize([{}])).toThrowError();
        });
    });
});
