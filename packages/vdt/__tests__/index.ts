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
        it('should generate common element without children', () => {
            test(`<div></div>`);
        });

        it('should generate common element with string children', () => {
            test(`<div>test</div>`);
        });

        it('should generate common element with props', () => {
            test(`<div id="1">test</div>`);
        });

        it('should generate common elememt with string className', () => {
            test(`<div class="a">test</div>`);
        });

        it('should generate common element with expression className', () => {
            test(`<div class={a}>test</div>`);
        });

        it('should generate common element with string key', () => {
            test(`<div key="a">test</div>`);
        });

        it('should generate common element with expression key', () => {
            test(`<div key="a">test</div>`);
        });

        it('should generate common element with string ref', () => {
            test(`<div ref="b">test</div>`);
        });

        it('should generate common elememt with expression ref', () => {
            test(`<div ref={b}>test</div>`);
        });

        it('should generate common element with element children', () => {
            test(`<div><div class="a"></div></div>`);
        });

        it('should generate common element with multiple element children', () => {
            test(`<div><div class="a"></div><div></div></div>`);
        });

        it('should generate common element with expression children', () => {
            test(`<div>{a}</div>`);
        });
    });

    describe('JS', () => {
        it('should generate js code', () => {
            test(stripIndent`
                const a = 1;
                const b = 2;
                <div>{a}</div>
            `);
        });
    });

    describe('Beautify', () => {
        it('should beautify expression', () => {
            test(stripIndent`
                <div>
                    {() => {
                        return 'a'
                    }}
                </div>
            `);
        });

        it('should beautify expression that has element sibling', () => {
            test(stripIndent`
                <div>
                    {() => {
                        return 'a'
                    }}
                    <div></div>
                </div>
            `);
        });

        it('should beautify expression that return element', () => {
            test(stripIndent`
                <div>
                    {() => {
                        return <div></div>
                    }}
                </div>
            `);
        });

        it('should beautify js expression code', () => {
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
