// require('./defaults');
// require('./intactReact');
// import Benchmark from 'benchmark';

// const suite = new Benchmark.Suite;

// const defaultsFn = () => {
    // return {
        // a: 1,
        // b: 2,
    // };
// };

// const defaultsObj = {
    // a: 1,
    // b: 2,
// };

// suite.add('return object', () => {
    // const props = defaultsFn();
// }).add('merge object', () => {
    // const props: any = {};
    // for (let key in defaultsObj) {
        // props[key] = defaultsObj[key as keyof typeof defaultsObj];
    // }
// }).run({'async': false});

import './render';
