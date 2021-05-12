export * from './common';
import * as Vdt from 'vdt';
import {Template} from 'vdt';
import {Parser, Visitor} from 'vdt-compiler';

const cache: {[key: string]: Template} = {};

export function compile(source: string): Template {
    if (cache[source]) return cache[source];

    const parser = new Parser(source);
    const visitor = new Visitor(parser.ast);
    const code = visitor.getCode();

    return (cache[source] = new Function('_$vdt', code)(Vdt));
}

Vdt.registerCompile(compile);
