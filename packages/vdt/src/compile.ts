import {Parser} from './compiler/parser';
import {Visitor} from './compiler/visitor';
import * as Vdt from './runtime';
import {Template} from 'intact';

const cache: {[key: string]: Template} = {};

export function compile(source: string): Template {
    if (cache[source]) return cache[source];

    const parser = new Parser(source);
    const visitor = new Visitor(parser.ast);
    const code = visitor.getCode();

    return (cache[source] = new Function('_$vdt', code)(Vdt));
}
