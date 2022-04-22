declare const expect: Chai.ExpectStatic
declare const sinon: Sinon
declare const benchmark: Benchmark

namespace Chai {
    interface Assertion {
        matchSnapshot(): Assertion
    }
}

declare module "*.vue" {
    import type {DefineComponent} from 'vue';
    const component: DefineComponent<{}, {}, any>
    export default component;
}

namespace JSX {
    type Element = Exclude<Element, keyof Element>
    interface Element extends React.ReactElement<any, any> {}

    interface ElementClass {
        $props?: {}
    }
    interface ElementAttributesProperty {
        $props?: {}
    }
    interface IntrinsicAttributes {
        ref?: React.LegacyRef<any> | undefined;
    }
}