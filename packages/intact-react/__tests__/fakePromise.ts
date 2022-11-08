import {FakePromise, FakePromises} from '../src/fakePromise';
import {wait} from '../../misstime/__tests__/utils';

describe('Intact React', () => {
    describe('FakePromise', () => {
        it('resolve all promises added before `all` method', async () => {
            const spy1 = sinon.spy(() => console.log(1));
            const spy2 = sinon.spy(() => console.log(2));
            const spy3 = sinon.spy(() => console.log(3));
            const promises = new FakePromises();

            promises.add(new FakePromise(resolve => {
                new Promise<void>(resolve => resolve()).then(() => {
                    spy1();
                    resolve();
                });
            }));
            promises.add(new FakePromise(resolve => {
                new Promise<void>(resolve => resolve()).then(() => {
                    spy2();
                    resolve();
                });
            }));

            FakePromise.all(promises).then(() => {
                spy3();
            });

            await wait(0);

            expect(spy1.calledBefore(spy2)).to.true;
            expect(spy2.calledBefore(spy3)).to.true;
        });

        it('resolve all promises when we call `all` again amid adding promises', async () => {
            const spy1 = sinon.spy(() => console.log(1));
            const spy2 = sinon.spy(() => console.log(2));
            const spy3 = sinon.spy(() => console.log(3));
            const spy4 = sinon.spy(() => console.log(4));
            const spy5 = sinon.spy(() => console.log(5));
            const spy6 = sinon.spy(() => console.log(6));
            const promises = new FakePromises();

            promises.add(new FakePromise(resolve => {
                new Promise<void>(resolve => resolve()).then(() => {
                    spy1();
                    resolve();
                });
            }));

            FakePromise.all(promises).then(() => {
                spy5();
            });

            promises.add(new FakePromise(resolve => {
                new Promise<void>(resolve => resolve()).then(() => {
                    spy2();
                    resolve();
                });
            }));
            promises.add(new FakePromise(resolve => {
                new Promise<void>(resolve => resolve()).then(() => {
                    spy3();
                    resolve();
                });
            }));


            FakePromise.all(promises).then(() => {
                spy6();
            });

            promises.add(new FakePromise(resolve => {
                new Promise<void>(resolve => resolve()).then(() => {
                    spy4();
                    resolve();
                });
            }));

            await wait(0);
            expect(spy1.calledBefore(spy2)).to.true;
            expect(spy2.calledBefore(spy3)).to.true;
            expect(spy3.calledBefore(spy4)).to.true;
            expect(spy4.calledBefore(spy5)).to.true;
            expect(spy5.calledBefore(spy6)).to.true;
            // promises.add(new FakePromise(resolve => {
                // new Promise<void>(resolve => resolve()).then(() => {
                    // spy3();
                    // resolve();
                // });
            // }));

            // FakePromise.all(promises).then(() => {
                // spy5();
            // });
        });
    });
});
