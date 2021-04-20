declare const expect: Chai.ExpectStatic
declare const sinon: Sinon

namespace Chai {
    interface Assertion {
        matchSnapshot(): Assertion
    }
}
