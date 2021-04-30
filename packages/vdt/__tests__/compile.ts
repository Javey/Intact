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

describe('Vdt Compile', () => {
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
        });

        it('expression attribute', () => {
            test(`<div {...a} a="1"></div>`);
        });

        it('text tag', () => {
            test(`<textarea><div>{'a'}</div></textarea>`);
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

        it('with directive if', () => {
            test(stripIndent`
                <div>
                    <b:block params={[a, b]} v-if={a}>
                        <div>test</div>
                    </b:block>
                </div>
            `);
        });

        it('with directive for', () => {
            test(stripIndent`
                <div>
                    <b:block params={[a, b]} v-for={a}>
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

            it('checkbox with trueValue and falseValue', () => {
                test(`<input v-model="propName" v-model-true="1" type="checkbox" v-model-false="2" />`);
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

            it('number type', () => {
                test(`<input v-model="propName" type="number" />`);
            });

            it('without type', () => {
                test(`<input v-model="propName"/>`);
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

            it('v-if with keyed multiple vNodes and non-keyed multiple vNdoes', () => {
                test(stripIndent`
                    <div>
                        <template v-if={a}>
                            <div key="a"></div>
                            <div key="b"></div>
                        </template>
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
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            a
                        </template>
                    </div>
                `);
            });

            it('v-for text with keyed element', () => {
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            a
                            <div key="a"></div>
                        </template>
                    </div>
                `);
            });

            it('v-for nested template text', () => {
                test(stripIndent`
                    <div>
                        <template v-for={a}>
                            <template>a</template>
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

            it('keyed element child', () => {
                test(`<div><div key="a"></div></div>`);
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

            it('keyed v-if with keyed element children', () => {
                test(stripIndent`
                    <div>
                        <div v-if={a} key="a"></div>
                        <div v-else key="a"></div>
                        <div key="b"></div>
                    </div>
                `);
            });

            it('non-keyed v-if with keyed element children', () => {
                test(stripIndent`
                    <div>
                        <div v-if={a} key="a"></div>
                        <div v-else></div>
                        <div key="b"></div>
                    </div>
                `);
            });
        });
    });

    describe('Extract Props', () => {
        it('should extract props if has not dynamic prop', () => {
            test(stripIndent`
                <div>
                    <div a="1" b class="c">a</div>
                    <div a="1" b>a</div>
                    <div a="1"></div>
                    <div a="1" class="c"></div>
                    <Div a="1" b class="c"></Div>
                </div>
            `);
        });

        it('should extract props which value is primitive value', () => {
            test(stripIndent`
                <div>
                    <div a={1}></div>
                    <div a={ 111 }></div>
                    <div a={true}></div>
                    <div a={false}></div>
                    <div a={null}></div>
                    <div a={undefined}></div>
                </div>
            `);
        });

        it('should not extract props if has v-model', () => {
             test(stripIndent`
                <div>
                    <input a="1" b class="c" v-model="a" />
                    <Div a="1" b class="c" v-model="a"></Div>
                </div>
            `);
        });

        it('should not extract props if has blocks', () => {
            test(stripIndent`
                <div>
                    <div a="1"><b:block /></div>
                    <Div a="1"><b:block /></Div>
                </div>
            `)
        });

        it('should extract props if text tag has not expression', () => {
            test(stripIndent`
                <textarea><div>aaa</div></textarea>
            `);
        });
    });

    describe('ESM', () => {
        it('should compile to esm code', () => {
            const template = stripIndent`
                import a from 'b';
                const a = 1;
                <Div a="1"><div>{a}</div></Div>
            `;
            const parser = new Parser(template);
            const visitor = new Visitor(parser.ast);
            const code = visitor.getModuleCode();
            console.log(code);
            expect(code).to.matchSnapshot();

        });
    });

    describe('Validate', () => {
        it('should throw when v-raw on component', () => {
            expect(() => test(`<C v-raw>test</C>`)).to.throw();
        });

        it('should throw if v-for-key / v-for-value is not a literal string', () => {
            expect(() => test(`<div v-for={a} v-for-key={'a'}></div>`)).to.throw();
            expect(() => test(`<div v-for={a} v-for-value={'a'}></div>`)).to.throw();
        });

        it('should throw if v-for / v-if / v-else-if is not a expression', () => {
            expect(() => test(`<div v-for="a"></div>`)).to.throw();
            expect(() => test(`<div v-if="a"></div>`)).to.throw();
            expect(() => test(`<div v-else-if="a"></div>`)).to.throw();
        });

        it('should throw if v-else has value', () => {
            expect(() => test(`<div v-else="a"></div>`)).to.throw();
        });

        it('should throw if use v-model on non-form element', () => {
            expect(() => test(`<div v-model="a"></div>`)).to.throw();
        });

        it('should throw if use v-model but type is dynamic', () => {
            expect(() => test(`<input v-model="a" type={type} />`)).to.throw();
        });

        it('should throw if block has invalid attribute', () => {
            expect(() => test(`<b:block key="a" />`)).to.throw();
            expect(() => test(`<b:block args={a} />`)).to.throw();
            expect(() => test(`<b:block params='a' />`)).to.throw();
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
