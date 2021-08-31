declare const expect: Chai.ExpectStatic
declare const sinon: Sinon
declare const benchmark: Benchmark

namespace Chai {
    interface Assertion {
        matchSnapshot(): Assertion
    }
}

// declare module "*.vue" {
    // import {defineComponent} from 'vue';
    // const component: ReturnType<typeof defineComponent>;
    // export default component;
// }

// declare global {
//     namespace JSX {
//         interface ElementClass extends React.Component<any> {
//             render(): React.ReactNode;
//             a: boolean;
//         }
//     }
// }
