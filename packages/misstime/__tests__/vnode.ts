import {createElementVNode} from '../src/core/vnode';
import {Types, ChildrenTypes, VNode}  from '../src/utils/types';

describe('VNode', () => {
    it('should throw error if we createVNode for Component', () => {
        expect(() => createElementVNode(Types.ComponentFunction, '', ChildrenTypes.HasInvalidChildren)).to.throw();
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

        expect(vNode.type).to.eql(Types.CommonElement);
        expect(vNode.tag).to.eql('div');
        expect(vNode.childrenType).to.eql(ChildrenTypes.HasInvalidChildren);
        expect(vNode.children).to.eql(null);
        expect(vNode.className).to.eql('class-name');
        expect(vNode.props).to.eql(props);
        expect(vNode.key).to.eql('key');
        expect(vNode.ref).to.eql(ref);
    });

    it('should validate children', () => {
        expect(() => {
            createElementVNode(Types.CommonElement, 'input', 'test', ChildrenTypes.UnknownChildren);
        }).to.throw(`Intact Error: input elements can't have children.`);
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

            expect((vNode.children as VNode[]).map(vNode => vNode.key)).to.eql(['$0', '$1', '$2', '$3', '$4']);
            expect(vNode.childrenType & ChildrenTypes.HasKeyedChildren).to.be.greaterThan(0);
        });

        it('should normalize invalid children', () => {
            const vNode = normalize(false);

            expect(vNode.children as any).to.equal(false);
            expect(vNode.childrenType).to.equal(ChildrenTypes.HasInvalidChildren);
        });

        it('should normalize string children', () => {
            const vNode = normalize('1');

            expect(vNode.children).to.equal('1');
            expect(vNode.childrenType).to.equal(ChildrenTypes.HasTextChildren);
        });

        it('should normalize number children', () => {
            const vNode = normalize(1);

            expect(vNode.children).to.equal(1);
            expect(vNode.childrenType).to.equal(ChildrenTypes.HasTextChildren);
        });

        it('should normalize children with invalid vNode', () => {
            const vNode = normalize([null, createElementVNode(Types.CommonElement, 'span')]);

            expect((vNode.children as VNode[]).map(vNode => vNode.key)).to.eql(['$1']);
        });

        it('should normalize children with string vNode', () => {
            const vNode = normalize([
                'string',
                createElementVNode(Types.CommonElement, 'span')
            ]);

            expect((vNode.children as VNode[]).map(vNode => vNode.key)).to.eql(['$0', '$1']);
        });

        it('should normalize children that all vNodes are invalid', () => {
            const vNode = normalize([null, true]);

            expect(vNode.children as VNode[]).to.eql([]);
            expect(vNode.childrenType).to.equal(ChildrenTypes.HasInvalidChildren);
        });

        it('should normalize children that are empty array', () => {
            const vNode = normalize([]);

            expect(vNode.children as VNode[]).to.eql([]);
            expect(vNode.childrenType).to.equal(ChildrenTypes.HasInvalidChildren);
        });

        it('should normalize children that is a vNode', () => {
            const vNode = normalize(createElementVNode(Types.CommonElement, 'span'));

            expect((vNode.children as VNode).tag).to.equal('span');
            expect(vNode.childrenType).to.equal(ChildrenTypes.HasVNodeChildren);
        });

        it('should normalize children that have been normalized', () => {
            const children = createElementVNode(Types.CommonElement, 'span');
            const vNode1 = normalize(children);
            const vNode2 = normalize(children);

            expect(vNode1.children === vNode2.children).to.equal(false);
        });

        it('should normalize children that contains normalized vNode', () => {
            const child = createElementVNode(Types.CommonElement, 'span');
            const vNode1 = normalize([child, createTestVNodeWithKey()]);
            const vNode2 = normalize([createTestVNodeWithKey(), child]);

            const children1 = vNode1.children as VNode[];
            const children2 = vNode2.children as VNode[];
            expect(children1[0] === children2[1]).to.equal(false);
            expect(children1.map(vNode => vNode.key)).to.eql(['$0', 'key']);
            expect(children2.map(vNode => vNode.key)).to.eql(['key', '$1']);
        });

        it('should normalize children that contains normalized vNode in nested array', () => {
            const child = createElementVNode(Types.CommonElement, 'span');
            const childWithKey = createTestVNodeWithKey();
            const vNode1 = normalize([child, childWithKey]);
            const vNode2 = normalize([[child, childWithKey]]);
            const vNode3 = normalize([[[child, childWithKey]]]);

            [vNode1, vNode2, vNode3].forEach(vNode => {
                expect((vNode.children as VNode[]).map(vNode => vNode.key)).to.eql(['$0', 'key']);
            });
        });

        it('should throw error if has invalid child', () => {
            expect(() => normalize([{}])).to.throw();
        });
    });
});
