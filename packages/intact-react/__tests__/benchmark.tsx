import { Component as IntactComponent, compile } from '../src';
import { Component as ReactComponent} from 'react';
import ReactDom from 'react-dom';
import {act} from 'react-dom/test-utils';

describe('Benchmark', () => {
    const data: any[] = [];

    for (let i = 0; i < 100000; i++) {
        data.push({
            key: i++,
            firstName: 'John',
            lastName: 'Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
        });
    }

    class IntactDemo extends IntactComponent<any> {
        static template = compile(`
            <table>
                <thead>
                    <tr>
                        <th title="First Name" colspan="1" rowspan="1">
                            <div class="k-table-title">
                                <div class="k-table-title-text c-ellipsis">First Name</div>
                            </div>
                        </th>
                        <th title="Last Name" colspan="1" rowspan="1">
                            <div class="k-table-title">
                                <div class="k-table-title-text c-ellipsis">Last Name</div>
                            </div>
                        </th>
                        <th title="Age" colspan="1" rowspan="1">
                            <div class="k-table-title">
                                <div class="k-table-title-text c-ellipsis">Age</div>
                            </div>
                        </th>
                        <th title="Address" colspan="1" rowspan="1">
                            <div class="k-table-title">
                                <div class="k-table-title-text c-ellipsis">Address</div>
                            </div>
                        </th>
                        <th title="Tags" colspan="1" rowspan="1">
                            <div class="k-table-title">
                                <div class="k-table-title-text c-ellipsis">Tags</div>
                            </div>
                        </th>
                        <th title="Action" colspan="1" rowspan="1">
                            <div class="k-table-title">
                                <div class="k-table-title-text c-ellipsis">Action</div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for={this.get('data')}>
                        <td v-for={$value}>{$value}</td>
                    </tr>
                </tbody>
            </table>
        `);
    }

    class ReactDemo extends ReactComponent<any> {
        render() {
            const props = this.props;
            return (
                <table>
                    <thead>
                        <tr>
                            <th title="First Name">
                                <div className="k-table-title">
                                    <div className="k-table-title-text c-ellipsis">First Name</div>
                                </div>
                            </th>
                            <th title="Last Name">
                                <div className="k-table-title">
                                    <div className="k-table-title-text c-ellipsis">Last Name</div>
                                </div>
                            </th>
                            <th title="Age">
                                <div className="k-table-title">
                                    <div className="k-table-title-text c-ellipsis">Age</div>
                                </div>
                            </th>
                            <th title="Address">
                                <div className="k-table-title">
                                    <div className="k-table-title-text c-ellipsis">Address</div>
                                </div>
                            </th>
                            <th title="Tags">
                                <div className="k-table-title">
                                    <div className="k-table-title-text c-ellipsis">Tags</div>
                                </div>
                            </th>
                            <th title="Action">
                                <div className="k-table-title">
                                    <div className="k-table-title-text c-ellipsis">Action</div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.data.map(($value: any) => {
                            return <tr>
                                {Object.keys($value).map((key: any) => {
                                    return <td>{$value[key]}</td>
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            );
        }
    }

    it('intact-react', function() {
        this.timeout(0);
        const now = Date.now();
        const container = document.createElement('div');
        document.body.appendChild(container);

        act(() => {
            ReactDom.render(<IntactDemo data={data} />, container);
        });
        console.log(Date.now() - now);
    });

    it('react', function() {
        this.timeout(0);

        const now = Date.now();
        const container = document.createElement('div');
        document.body.appendChild(container);

        act(() => {
            ReactDom.render(<ReactDemo data={data} />, container);
        });
        console.log(Date.now() - now);
    });
});
