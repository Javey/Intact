import {Parser} from './parser';
import {Visitor} from './visitor';
import {Options} from './types';

export function compile(source: string, options?: Options) {
    const parser = new Parser(source, options);
    const visitor = new Visitor(parser.ast);
    const code = visitor.getCode();

    return new Function('_$vdt', code);
}
