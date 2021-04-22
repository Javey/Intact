import {Parser} from '../src/parser';
import {Visitor} from '../src/visitor';
import {stripIndent} from 'common-tags';

function generate(template: string) {
    const parser = new Parser(template);
    const visitor = new Visitor(parser.ast);
    
    return visitor.getCode();
}

function test(template: string) {
    const code = generate(template);
    console.log(code);
    expect(code).to.matchSnapshot();
}

describe('Generate', () => {
    afterEach(function() {
        if (this.currentTest!.err) {
            console.error(this.currentTest!.err);
        }
    });

    describe('Common Element', () => {
        it('without children', () => {
            test(`<div></div>`);
        });

        it('string children', () => {
            test(`<div>test</div>`);
        });

        it('props', () => {
            test(`<div id="1">test</div>`);
        });

        it('string className', () => {
            test(`<div class="a">test</div>`);
        });

        it('expression className', () => {
            test(`<div class={a}>test</div>`);
        });

        it('string key', () => {
            test(`<div key="a">test</div>`);
        });

        it('expression key', () => {
            test(`<div key={a}>test</div>`);
        });

        it('string ref', () => {
            test(`<div ref="b">test</div>`);
        });

        it('expression ref', () => {
            test(`<div ref={b}>test</div>`);
        });

        it('element children', () => {
            test(`<div><div class="a"></div></div>`);
        });

        it('multiple element children', () => {
            test(`<div><div class="a"></div><div></div></div>`);
        });

        it('expression children', () => {
            test(`<div>{a}</div>`);
        });
    });

    describe('Component', () => {
        it('without children', () => {
            test(`<Div></Div>`);
        });

        it('string children', () => {
            test(`<Div>test</Div>`);
        });

        it('props', () => {
            test(`<Div id="1">test</Div>`);
        });

        it('string className', () => {
            test(`<Div class="a">test</Div>`);
        });

        it('expression className', () => {
            test(`<Div class={a}>test</Div>`);
        });

        it('string key', () => {
            test(`<Div key="a">test</Div>`);
        });

        it('expression key', () => {
            test(`<Div key={a}>test</Div>`);
        });

        it('string ref', () => {
            test(`<Div ref="b">test</Div>`);
        });

        it('expression ref', () => {
            test(`<Div ref={b}>test</Div>`);
        });

        it('element children', () => {
            test(`<Div><div class="a"></div></Div>`);
        });

        it('multiple element children', () => {
            test(`<Div><div class="a"></div><div></div></Div>`);
        });

        it('expression children', () => {
            test(`<Div>{a}</Div>`);
        });

        it('component children', () => {
            test(`<Div><Span /></Div>`);
        });

        it('block children', () => {
            test(stripIndent`
                <Div>
                    <b:test>
                        <A>test</A>
                    </b:test>
                </Div>
            `)
        });
    });

    describe('Diretives', () => {
        it('v-if', () => {
            test(stripIndent`
                <div>
                    <div v-if={a}>a</div>
                    <div v-else-if={b}>b</div>
                    <div v-else-if={c}>c</div>
                    <div v-else>d</div>
                </div>
            `);
        });

        it('v-for', () => {
            test(`<div><div v-for={a}></div></div>`);
        });

        it('v-for-key v-for-value', () => {
            test(`<div><div v-for={a} v-for-key="a" v-for-value="b"></div></div>`);
        });

        it('should genreate v-if and v-for', () => {
            test(`<div><div v-for={a} v-if={value}></div></div>`);
        });
    });

    describe('JS', () => {
        it('js code', () => {
            test(stripIndent`
                const a = 1;
                const b = 2;
                <div>{a}</div>
            `);
        });
    });

    describe('Beautify', () => {
        it('expression', () => {
            test(stripIndent`
                <div>
                    {() => {
                        return 'a'
                    }}
                </div>
            `);
        });

        it('expression that has element sibling', () => {
            test(stripIndent`
                <div>
                    {() => {
                        return 'a'
                    }}
                    <div></div>
                </div>
            `);
        });

        it('expression that return element', () => {
            test(stripIndent`
                <div>
                    {() => {
                        return <div></div>
                    }}
                </div>
            `);
        });

        it('js expression code', () => {
            test(stripIndent`
                const a = 1;
                const b = 2;
                <div>
                    {() => {
                        return (
                            <span 
                                class={
                                    {
                                        a: true,
                                        b: () => {
                                            return 'c'
                                        }
                                    }
                                }
                            >
                                test
                                {() => {
                                    return <i>
                                        {() => {
                                            return 'a'
                                        }}
                                    </i>
                                }}
                            </span>
                        )
                    }}
                    {<div>test</div>}
                    <div></div>
                    {
                        () => {
                            return a;
                        } 
                    }
                    <input />
                </div>
            `);
        })
    });
});
