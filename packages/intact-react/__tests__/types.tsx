import {Component} from '../src';

class A extends Component<{value?: number}> { }

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
const i = <A on$change-value={(a, b) => {}} />
const j = <A onClick={() => {}} />
const k = <A onEvent={() => {}} />
