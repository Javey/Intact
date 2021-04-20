import {Parser} from '../src/parser';
import {Visitor} from '../src/visitor';

describe('Generate', () => {
    it('should generate common element with string children', () => {
        const template = `<div>test</div>`;
        const parser = new Parser(template);
        const visitor = new Visitor(parser.ast);

        console.log(visitor.getCode());
        expect(visitor.getCode()).to.matchSnapshot();
    });
});
