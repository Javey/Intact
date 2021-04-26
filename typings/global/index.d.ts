declare const expect: Chai.ExpectStatic
declare const sinon: Sinon
declare const benchmark: Benchmark

namespace Chai {
    interface Assertion {
        matchSnapshot(): Assertion
    }
}
