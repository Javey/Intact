import {Parser} from './parser';
import {Visitor} from './visitor';
import * as Vdt from './index';
import {Template} from 'intact';

export function compile(source: string): Template {
    const parser = new Parser(source);
    const visitor = new Visitor(parser.ast);
    const code = visitor.getCode();

    return new Function('_$vdt', code)(Vdt);
}
