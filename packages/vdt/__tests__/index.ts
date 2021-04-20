import {Parser} from '../src/parser';
import {Visitor} from '../src/visitor';

// function eql(a: string, b: string) {
    // const lines = a.split(/\n/);

// }

describe('Generate', () => {
    it('should generate common element with string children', () => {
        const template = `<div>test</div>`;
        const parser = new Parser(template);
        const visitor = new Visitor(parser.ast);

        console.log(visitor.getCode());
        // console.log(MatchesSnapshot);
        // expect(visitor.getCode()).toMatchSnapshot();
        expect(1).to.eql(3);
    });
});
