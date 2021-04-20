import {Parser} from '../src/parser';
import {Visitor} from '../src/visitor';

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
    });
});
