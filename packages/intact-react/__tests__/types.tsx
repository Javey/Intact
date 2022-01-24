import {Component, Children} from '../src';
import React from 'react';

interface Events {
    fire: [number]
    multiArgs: [number, string]
    error: [number, string]
}

class A extends Component<
    {value?: number},
    Events,
    {
        item: [number, number],
        body: null,
    }
> { 

}

// @ts-expect-error
const a = <A a={1}/>
const b = <A className="a" />
const c = <A style="a" />
// @ts-expect-error
const d = <A value="a" />
const e = <A value={1} />
// @ts-expect-error
const f = <A value={1} a={1} />
const g = <A value={1} onChangeValue={() => {}} />
// @ts-expect-error
const h = <A value={1} onChangeValue={() => {}} onChangeA={() => {}} />
// const i = <A on$change-value={(a, b) => {}} />
const j = <A onClick={() => {}} />
// @ts-expect-error
const k = <A onEvent={() => {}} />
const k1 = <A onMultiArgs={(a: number) => {}} />
const k2 = <A onError={(a: number) => {}} />
const onClick = (e: Event) => {}
const k3 = <A onClick={onClick} />
const onClickError = (e: number) => {}
// @ts-expect-error
const k4 = <A onClick={onClickError} />

// slot
// @ts-expect-error
const l = <A slotBody={(data: any) => console.log(data)}/>
// @ts-expect-error
const m = <A slotBody={{a: 1}} />
const m1 = <A slotBody={<><div></div></>} />
const m11 = <A slotBody={<React.Fragment>test</React.Fragment>} />
const m2 = <A slotBody={1} />
const n = <A slotItem={data => {console.log(data); return 1;}}/>
// @ts-expect-error
const n1 = <A slotItem={data => {console.log(data); return true;}}/>
// @ts-expect-error
const o = <A slotItem={1} />
// @ts-expect-error
const p = <A slotA={1} />

// event
const e1 = <A onFire={num => expectType<number>(num)} />;

interface BProps {
    value: number
}

function _B(props: BProps) {
    return <A />;
}

const B = Component.functionalWrapper(_B);

const test1 = <B value={1} />
// @ts-expect-error
const test2 = <B a={1} />
// @ts-expect-error
const test3 = <B value="1" />

function expectType<T>(value: T): void { }
