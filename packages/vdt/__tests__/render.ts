import * as Vdt from '../src/index';
import {render, createVNode as h} from 'misstime';
import {stripIndent} from 'common-tags';
import {Component} from 'intact';

describe('Vdt Render', () => {
    let container: HTMLDivElement

    function test(source: string, data?: any, blocks?: Record<string, Function>) {
        const template = Vdt.compile(source)(Vdt);
        render(template(data, blocks), container);
        console.log(template, container.innerHTML);
        expect(container.innerHTML).to.matchSnapshot();
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.append(container);
    });

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

    it('render blocks', () => {
        test(stripIndent`
            <div>
                <b:test>
                    <div class="a"></div>
                </b:test>
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

    describe('Directives', () => {
        it('render v-if', () => {
            test(stripIndent`
                <template>
                    <div v-if={true}>true</div>
                    <div v-else>false</div>
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

        it('render v-for', () => {
            test(stripIndent`
                <div>
                    <div v-for={[1, 2, 3]}>{value}</div>
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
                    <div v-for={{a: 1, b: 2}}>{key}: {value}</div>
                </div>
            `);
        });

        it('should throw error if v-for value is invalid', () => {
            expect(() => {
                test(stripIndent`
                    <div>
                        <div v-for={1}>{key}: {value}</div>
                    </div>
                `);
            }).to.throw();
        });

        it('should throw if v-for null', () => {
            expect(() => {
                test(stripIndent`
                    <div>
                        <div v-for={null}>{key}: {value}</div>
                    </div>
                `);
            }).to.throw();
        });

        it('v-for empty array', () => {
            test(stripIndent`
                <div>
                    <div v-for={[]}>{key}: {value}</div>
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
            test('const C = $props.C; <C />', {
                C: class extends Component {
                    static template = () => {
                        return h('span');
                    }
                }
            });
        });
    });
});
