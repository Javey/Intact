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

describe('Vdt', () => {
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

        it('comment children', () => {
            test(`<div><!--test--></div>`);
        });

        it('unescape text children', () => {
            test(`<div>{= test }</div>`);
        })
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

        it('multiple block children', () => {
            test(stripIndent`
                <Div>
                    <b:foo><A>test</A></b:foo>
                    <b:bar>test</b:bar>
                </Div>
            `)
        });
    });

    describe('Block', () => {
        it('should throw if attribute is invalid', () => {
            expect(() => test(`<b:block key="a" />`)).to.throw();
            expect(() => test(`<b:block args={a} />`)).to.throw();
            expect(() => test(`<b:block params='a' />`)).to.throw();
        });

        it('without args and params', () => {
            test(stripIndent`
                <div>
                    <b:block>
                        <div>test</div>
                    </b:block>
                </div>
            `);
        });

        it('with args', () => {
            test(stripIndent`
                <div>
                    <b:block args="a, b">
                        <div>test</div>
                    </b:block>
                </div>
            `);
        });

        it('with params', () => {
            test(stripIndent`
                <div>
                    <b:block params={[a, b]}>
                        <div>test</div>
                    </b:block>
                </div>
            `);
        });
    });

    describe('Vdt', () => {
        it('without block children', () => {
            test(`<t:template></t:template>`);
        });

        it('with block children', () => {
            test(stripIndent`
                <t:template>
                    <b:block>test</b:block>
                </t:template>
            `);
        });

        it('with props', () => {
            test(stripIndent`
                <t:template class="a">
                    <b:block>test</b:block>
                </t:template>
            `);
        });

        it('as children', () => {
             test(stripIndent`
                <div>
                    <t:template class="a">
                        <b:block>test</b:block>
                    </t:template>
                </div>
            `);
        });

        it('as children and define block', () => {
             test(stripIndent`
                <div>
                    <t:template class="a">
                        <div>
                            <b:block>test</b:block>
                        </div>
                    </t:template>
                </div>
            `);
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

        it('v-if and v-for', () => {
            test(`<div><div v-for={a} v-if={value}></div></div>`);
        });

        describe('v-model', () => {
            it('radio without value', () => {
                test(`<input v-model="propName" type="radio" />`);
            });

            it('radio with value', () => {
                test(`<input v-model="propName" value="test" type="radio" />`);
            });

            it('checkbox without trueValue and falseValue', () => {
                test(`<input v-model="propName" type="checkbox" />`);
            });

            it('checkbox with trueValue', () => {
                test(`<input v-model="propName" v-model-true="1" type="checkbox" />`);
            });

            it('select', () => {
                test(`<select v-model="propName"></select>`);
            });

            it('textarea', () => {
                test(`<textarea v-model="propName"></textarea>`);
            });

            it('component', () => {
                test(`<Component v-model="propName" />`);
            });

            it('component with multipe v-model', () => {
                test(`<Component v-model="propName" v-model:name="myName" />`);
            });
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

    describe('Hoist', () => {
        it('import', () => {
            test(stripIndent`
                import {name} from 'xxxx';
                import a from 'xxxx'

                const b = a;
                <div>{b}</div>
            `);
        })
    });

    describe('ChildrenType', () => {
        describe('v-if', () => {
            it('v-if has not v-else', () => {
                test(stripIndent`
                    <div>
                        <div v-if={a}></div>
                    </div>
                `);
            });

            it('v-if has v-else', () => {
                test(stripIndent`
                    <div>
                        <div v-if={a}></div>
                        <span v-else></span>
                    </div>
                `);
            });

            it('v-if invalid element', () => {
                test(stripIndent`
                    <div>
                        <template v-if={a}></template>
                        <template v-else></template>
                    </div>
                `);
            });

            it('v-if text element', () => {
                test(stripIndent`
                    <div>
                        <template v-if={a}>a</template>
                        <template v-else>b</template>
                    </div>
                `);
            });
            
            it('v-if with expression element', () => {
                test(stripIndent`
                    <div>
                        <template v-if={a}>{a}</template>
                        <template v-else>b</template>
                    </div>
                `);
            });

            it('v-if with single vNode and multiple vNodes', () => {
                test(stripIndent`
                    <div>
                        <div v-if={a}>{a}</div>
                        <template v-else>
                            <div></div>
                            <div></div>
                        </template>
                    </div>
                `);
            });
        });

        describe('v-for', () => {
            it('v-for keyed vNode', () => {
                test(stripIndent`
                    <div>
                        <div v-for={a} key={value}>{a}</div>
                    </div>
                `);
            });

            it('v-for non-keyed vNode', () => {
                test(stripIndent`
                    <div>
                        <div v-for={a}>{a}</div>
                    </div>
                `);
            });

            it('v-for multiple keyed children', () => {
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            <div key="a"></div>
                            <div key="b"></div>
                        </template>
                    </div>
                `);
            });

            it('v-for multiple non-keyed children', () => {
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            <div></div>
                            <div></div>
                        </template>
                    </div>
                `);
            });

            it('v-for with multiple non-keyed and keyed children', () => {
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            <div></div>
                            <div key="b"></div>
                        </template>
                    </div>
                `);
            });
            
            it('v-for with non-keyed v-if without v-else', () => {
                 test(stripIndent`
                    <div>
                        <div v-for={a} v-if={a}></div>
                    </div>
                `);
            });

            it('v-for with non-keyed v-if with v-else in template', () => {
                 test(stripIndent`
                    <div>
                        <template v-for={a}>
                            <div v-if={a}></div>
                            <div v-else></div>
                        </template>
                    </div>
                `);
            });

            it('v-for with keyed v-if with v-else in template', () => {
                 test(stripIndent`
                    <div>
                        <template v-for={a}>
                            <div v-if={a} key="a"></div>
                            <div v-else key="a"></div>
                        </template>
                    </div>
                `);
            });

            it('v-for text', () => {
                // TODO
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            a
                        </template>
                    </div>
                `);
            });
        });

        describe('Single Child', () => {
            it('expression child', () => {
                test(`<div>{a}</div>`);
            });

            it('text child', () => {
                test(`<div>a</div>`);
            });

            it('element child', () => {
                test(`<div><div></div></div>`);
            });

            it('component child', () => {
                test(`<div><Div></Div></div>`);
            });

            it('comment child', () => {
                test(`<div><!----></div>`);
            });

            it('unescape text child', () => {
                test(`<div>{=a}</div>`);
            });

            it('block child', () => {
                test(`<div><b:block>test</b:block></div>`);
            });

            it('vdt child', () => {
                test(`<div><t:vdt /></div>`);
            });

            it('template text child', () => {
                test(`<div><template>a</template></div>`);
            });
        });

        describe('Multiple Children', () => {
            it('keyed children', () => {
                test(stripIndent`
                    <div>
                        <div key="a"></div>
                        <div key="b"></div>
                    </div>
                `);
            });

            it('non-keyed children', () => {
                test(stripIndent`
                    <div>
                        <div></div>
                        <div></div>
                    </div>
                `);
            });

            it('keyed and non-keyed children', () => {
                test(stripIndent`
                    <div>
                        <div key="a"></div>
                        <div></div>
                    </div>
                `);
            });

            it('non-keyed template children', () => {
                 test(stripIndent`
                    <div>
                        <template>
                            <div></div>
                            <div></div>
                        </template>
                    </div>
                `);
            });

            it('keyed template children', () => {
                 test(stripIndent`
                    <div>
                        <template>
                            <div key="a"></div>
                            <div key="a"></div>
                        </template>
                    </div>
                `);
            });

            it('non-keyed template with keyed children', () => {
                 test(stripIndent`
                    <div>
                        <template>
                            <div></div>
                            <div></div>
                        </template>
                        <div key="a"></div>
                    </div>
                `);
            });

            it('keyed template with keyed children', () => {
                 test(stripIndent`
                    <div>
                        <template>
                            <div key="a"></div>
                            <div key="a"></div>
                        </template>
                        <div key="a"></div>
                    </div>
                `);
            });

            it('expression children with keyed children', () => {
                 test(stripIndent`
                    <div>
                        {a}
                        <div key="a"></div>
                    </div>
                `);
            });

            it('multiple text children', () => {
                 test(stripIndent`
                    <div>
                        <template>a</template>
                        <template>b</template>
                    </div>
                `);
            });

            it('text children with keyed children', () => {
                 test(stripIndent`
                    <div>
                        a
                        <div key="a"></div>
                    </div>
                `);
            });
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
