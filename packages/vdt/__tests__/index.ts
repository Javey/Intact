import {render, createVNode as h, VNode, Blocks} from 'misstime';
import {stripIndent} from 'common-tags';
import {Component} from 'intact';
import {dispatchEvent, nextTick} from '../../misstime/__tests__/utils';
import {Template} from '../src/types';
import * as Vdt from '../src';
import {Parser, Visitor} from 'vdt-compiler';

function compile(source: string): Template {
    const parser = new Parser(source);
    const visitor = new Visitor(parser.ast);
    const code = visitor.getCode();

    return new Function('_$vdt', code)(Vdt);
}

describe('Vdt Runtime', () => {
    let container: HTMLDivElement

    function test(source: string, data?: any, blocks?: Blocks) {
        const template = compile(source);
        render(template(data, blocks) as VNode, container);
        console.log(template, container.innerHTML);
        expect(container.innerHTML).to.matchSnapshot();
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.append(container);
    });

    describe('Common Element', () => {
        it('render common element', () => {
            test('<div></div>');
        });

        it('render common element with children', () => {
            test('<div>{$props.a}</div>', {a: 1});
        });

        it('render dynamic props', () => {
            test('<div id={$props.id}></div>', {id: 'id'});
        });

        it('render class', () => {
            test(stripIndent`
                <div>
                    <div class="a"></div>
                    <div class={{a: true}}></div>
                </div>
            `);
        });

        it('render null and number classname', () => {
             test(stripIndent`
                <div>
                    <div class={null}></div>
                    <div class={1}></div>
                </div>
            `);
        });

        it('render template', () => {
            test('<div><template>a</template></div>');
        });

        it('render with js', () => {
            test('const a = 1; <div>{a}</div>');
        });

        it('render comment', () => {
            test('<div><!--test--></div>');
        });

        it('render script', () => {
            test('<script>var a = {$props.a};</script>', {a: 1});
        });

        it('render textarea', () => {
            test('<textarea><div>{$props.a}</div></textarea>', {a: 1});
        });

        it('whitespaces between strings should not be skipped', () => {
            test(`<div> aa b <div>c </div> </div>`);
        });

        it('whitespaces between string and expression should not be skipped', () => {
            test(`<div> aa {$props.value} b <div>{$props.c}</div> </div>`, {value: 'a', c: 'c'});
        });

        it('whitespaces between expression and element should be skipped', () => {
            test(`const value = $props.value;<div> {value} b <div>{value} {value} </div> {value} </div>`, {value: 1});
        });
    });

    describe('Vdt & Block', () => {
        it('render blocks', () => {
            test(stripIndent`
                <div>
                    <b:test>
                        <div class="a"></div>
                    </b:test>
                </div>
            `);
        });

        it('render block with v-if', () => {
            test(stripIndent`
                <div>
                    <b:test v-if={false}>
                        <div class="a"></div>
                    </b:test>
                </div>
            `);
        });

        it('render block with v-for', () => {
            test(stripIndent`
                <div>
                    <b:test v-for={[1, 2]}>
                        <div class="a">{$value}</div>
                    </b:test>
                </div>
            `);
        });

        it('render vdt', () => {
            test(stripIndent`
                const template = $props.template;
                <t:template>
                    <b:block>1</b:block>
                </t:template>
            `, {
                template: compile(stripIndent`
                    <div><b:block>2</b:block></div>
                `)
            });
        });

        it('render vdt call parent', () => {
            test(stripIndent`
                const template = $props.template;
                <t:template>
                    <b:block>1{$super()}</b:block>
                </t:template>
            `, {
                template: compile(stripIndent`
                    <div><b:block>2</b:block></div>
                `)
            });
        });

        it('render vdt extends vdt', () => {
             test(stripIndent`
                const {ancenstor, father} = $props;
                <t:father ancenstor={ancenstor}>
                    <b:block>{$super()} child</b:block>
                </t:father>
            `, {
                ancenstor: compile(`<div><b:block>ancenstor</b:block></div>`),
                father: compile(stripIndent`
                    const ancenstor = $props.ancenstor;
                    <t:ancenstor>
                        <b:block>{$super()} father</b:block>
                    </t:ancenstor>
                `) 
            });
        });

        it('render block with data', () => {
            test(stripIndent`
                <ul>
                    <li v-for={['a', 'b']}>
                        <b:li params={[$value, $key]}>
                            {$key}: {$value}
                        </b:li>
                    </li>
                </ul>
            `)
        });

        it('extend block with data', () => {
            test(stripIndent`
                const father = $props.father;
                <t:father>
                    <b:li args="[value, key]">
                        {$super()} {value}_{key}
                    </b:li>
                </t:father>
            `, {
                father: compile(stripIndent`
                    <ul>
                        <li v-for={['a', 'b']}>
                            <b:li params={[$value, $key]}>
                                {$key}: {$value}
                            </b:li>
                        </li>
                    </ul>
                `)
            });
        });
    });

    describe('Directives', () => {
        it('render v-if', () => {
            test(stripIndent`
                <template>
                    <div v-if={true}>true</div>
                    <div v-else>false</div>
                </template>
            `);
        });

        it('render complex v-if', () => {
            test(stripIndent`
                <template>
                    <div v-if={1 ? true : false}>true</div>
                </template>
            `);
        });

        it('render v-if without v-else', () => {
            test(stripIndent`
                <template>
                    <div v-if={false}>true</div>
                </template>
            `);
        });

        it('render v-if as children', () => {
             test(stripIndent`
                <div>
                    <div v-if={true}>true</div>
                </div>
            `);
        });

        it('render v-if and v-else that there is element between them', () => {
            test(stripIndent`
                <div>
                    <div v-if={false}>false</div>
                    <div>middle</div>
                    <div v-else>true</div>
                </div>
            `);
        });

        it('render v-for', () => {
            test(stripIndent`
                <div>
                    <div v-for={[1, 2, 3]}>{$value}</div>
                </div>
            `);
        });

        it('render v-for multiple children', () => {
            test(stripIndent`
                <div>
                    <template v-for={[1, 2, 3]} v-for-key="a" v-for-value="b">
                        <div>{a}: {b}</div>
                        <div>{a}: {b}</div>
                    </template>
                </div>
            `);
        });

        it('render v-for keyed children', () => {
            test(stripIndent`
                <div>
                    <template v-for={[1, 2, 3]} v-for-key="a" v-for-value="b">
                        <div key={\`\${a}\${b}0\`}>{a}: {b}</div>
                        <div key={\`\${a}\${b}1\`}>{a}: {b}</div>
                    </template>
                </div>
            `);
        });

        it('render v-for object', () => {
            test(stripIndent`
                <div>
                    <div v-for={{a: 1, b: 2}}>{$key}: {$value}</div>
                </div>
            `);
        });

        it('should throw error if v-for value is invalid', () => {
            expect(() => {
                test(stripIndent`
                    <div>
                        <div v-for={1}>{$key}: {$value}</div>
                    </div>
                `);
            }).to.throw();
        });

        it('should throw if v-for null', () => {
            expect(() => {
                test(stripIndent`
                    <div>
                        <div v-for={null}>{$key}: {$value}</div>
                    </div>
                `);
            }).to.throw();
        });

        it('v-for empty array', () => {
            test(stripIndent`
                <div>
                    <div v-for={[]}>{$key}: {$value}</div>
                </div>
            `);
        });

        it('v-raw', () => {
            test(stripIndent`
                <div v-raw>
                    {a}<span></span>
                </div>
            `);
        });
    });

    describe('Component', () => {
        it('render class component', () => {
            test('const C = $props.C; <C />', {
                C: class extends Component {
                    static template = () => {
                        return h('span');
                    }
                }
            });
        });

        it('render function component', () => {
            test('const C = $props.C; <C />', {
                C: () => {
                    return h('span');
                }
            });
        });

        it('render blocks for class component', () => {
            test(stripIndent`
                const C = $props.C;
                <C>
                    <b:test>child</b:test>
                </C>
            `, {
                C: class extends Component {
                    static template = `<div><b:test>parent</b:test></div>`; 
                }
            });
        });


        it('render super', () => {
            class A extends Component {
                static template = `<div><b:test>a</b:test></div>`;
            }

            class B extends A {
                static template = `<t:super><b:test>{$super()}b</b:test></t:super>`;
            }

            test(`const B = $props.B; <B />`, {B});
        });
    });

    describe('v-model', () => {
        it('input', async () => {
            let component: Test | null;
            class Test extends Component<{a?: string}> {
                static template = `
                    <input v-model="a" />
                `;

                static defaults = () => ({a: 'test'});
            }
            render(h(Test, {ref: i => component = i}), container);

            const input = container.firstElementChild as HTMLInputElement;
            input.value = 'aaa';
            dispatchEvent(input, 'input');
            expect(component!.get('a')).to.equal('aaa');

            component!.set('a', 'a');
            await nextTick();
            expect(input.value).to.equal('a');
        });

        it('radio', async () => {
            let component: Test | null;
            class Test extends Component<{a?: number}> {
                static template = `
                    <div>
                        <input type="radio" v-model="a" value={1} />
                        <input type="radio" v-model="a" value={2} />
                    </div>
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const inputs = container.firstElementChild!.children;

            expect((inputs[0] as HTMLInputElement).checked).to.equal(false);
            expect((inputs[1] as HTMLInputElement).checked).to.equal(false);

            (inputs[1] as HTMLInputElement).click();
            expect(component!.get('a')).to.equal(2);

            component!.set('a', 1);
            await nextTick();
            expect((inputs[0] as HTMLInputElement).checked).to.equal(true);
            expect((inputs[1] as HTMLInputElement).checked).to.equal(false);
        });

        it('radio without value', async () => {
            let component: Test | null;
            class Test extends Component<{a?: string}> {
                static template = `
                    <input type="radio" v-model="a" />
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const input = container.firstElementChild as HTMLInputElement;

            expect(input.checked).to.equal(false);

            input.click();
            expect(component!.get('a')).to.equal('on');
        });

        it('checkbox without trueValue and falseValue', async () => {
            let component: Test | null;
            class Test extends Component<{a?: boolean}> {
                static template = `
                    <input type="checkbox" v-model="a" />
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const input = container.firstElementChild as HTMLInputElement;

            expect(input.checked).to.be.false; 

            input.click();
            expect(component!.get('a')).to.be.true;

            input.click();
            expect(component!.get('a')).to.be.false;

            component!.set('a', true);
            await nextTick();
            expect(input.checked).to.be.true; 
        });

        it('checkbox with trueValue and falseValue', async () => {
            let component: Test | null;
            class Test extends Component<{a?: string | number}> {
                static template = `
                    <input type="checkbox" v-model="a" v-model-true="1" v-model-false={2}/>
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const input = container.firstElementChild as HTMLInputElement;

            expect(input.checked).to.be.false; 

            input.click();
            expect(component!.get('a')).to.equal('1');

            input.click();
            expect(component!.get('a')).to.equal(2);

            component!.set('a', '1');
            await nextTick();
            expect(input.checked).to.be.true; 
        });

        it('single checkbox group', async () => {
            let component: Test | null;
            class Test extends Component<{a?: string | number}> {
                static template = `
                    <template>
                        <input type="checkbox" v-model="a" v-model-true="1" />
                        <input type="checkbox" v-model="a" v-model-true={2} />
                    </template>
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const inputs = container.children;
            const test = (...args: boolean[]) => {
                args.forEach((checked, i) => {
                    expect((inputs[i] as HTMLInputElement).checked).to.equal(checked);
                });
            };
            test(false, false);

            (inputs[0] as HTMLInputElement).click();
            expect(component!.get('a')).to.equal('1');

            (inputs[1] as HTMLInputElement).click();
            expect(component!.get('a')).to.equal(2);

            component!.set('a', '1');
            await nextTick();
        });

        it('multiple checkbox group', async () => {
            let component: Test | null;
            class Test extends Component<{a?: (string | number)[]}> {
                static template = `
                    <template>
                        <input type="checkbox" v-model="a" v-model-true="1" />
                        <input type="checkbox" v-model="a" v-model-true={2} />
                    </template>
                `;
                static defaults = () => ({a: []});
            }
            render(h(Test, {ref: i => component = i}), container);

            const inputs = container.children;
            const test = (...args: boolean[]) => {
                args.forEach((checked, i) => {
                    expect((inputs[i] as HTMLInputElement).checked).to.equal(checked);
                });
            };
            test(false, false);

            (inputs[0] as HTMLInputElement).click();
            expect(component!.get('a')).to.eql(['1']);

            (inputs[1] as HTMLInputElement).click();
            expect(component!.get('a')).to.eql(['1', 2]);

            (inputs[1] as HTMLInputElement).click();
            expect(component!.get('a')).to.eql(['1']);

            component!.set('a', [2]);
            await nextTick();
            test(false, true); 
        });

        it('textarea', async () => {
            let component: Test | null;
            class Test extends Component<{a?: string}> {
                static template = `
                    <textarea v-model="a"></textarea>
                `;

                static defaults = () => ({a: 'test'});
            }
            render(h(Test, {ref: i => component = i}), container);

            const input = container.firstElementChild as HTMLTextAreaElement;
            input.value = 'aaa';
            dispatchEvent(input, 'input');
            expect(component!.get('a')).to.equal('aaa');

            component!.set('a', 'a');
            await nextTick();
            expect(input.value).to.equal('a');
        });

        it('single select', async () => {
            let component: Test | null;
            class Test extends Component<{a?: string | number}> {
                static template = `
                    <select v-model="a">
                        <option value="1">1</option>
                        <option value={2}>2</option>
                    </select>
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const select = container.firstElementChild as HTMLSelectElement;
            expect(select.selectedIndex).to.equal(-1);

            select.selectedIndex = 0;
            dispatchEvent(select, 'change');
            expect(component!.get('a')).to.equal('1');

            select.selectedIndex = 1;
            dispatchEvent(select, 'change');
            expect(component!.get('a')).to.equal(2);

            component!.set('a', '1');
            await nextTick();
            expect(select.selectedIndex).to.equal(0);
        });

        it('multipe select', async () => {
            let component: Test | null;
            class Test extends Component<{a?: (string | number)[]}> {
                static template = `
                    <select v-model="a" multiple>
                        <option value="1">1</option>
                        <option value={2}>2</option>
                    </select>
                `;
            }
            render(h(Test, {ref: i => component = i}), container);

            const select = container.firstElementChild as HTMLSelectElement;
            expect(select.selectedIndex).to.equal(-1);

            select.options[0].selected = true;
            dispatchEvent(select, 'change');
            expect(component!.get('a')).to.eql(['1']);

            select.options[1].selected = true;
            dispatchEvent(select, 'change');
            expect(component!.get('a')).to.eql(['1', 2]);

            select.options[1].selected = false;
            dispatchEvent(select, 'change');
            expect(component!.get('a')).to.eql(['1']);

            component!.set('a', [2]);
            await nextTick();
            expect(select.options[0].selected).to.equal(false);
            expect(select.options[1].selected).to.equal(true);
        });
    });
});
