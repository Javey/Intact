import { Component as ReactComponent} from 'react';

export class ReactDemo extends ReactComponent<any> {
    render() {
        const {data, firstName, lastName, age, address, action} = this.props;
        return (
            <table>
                <thead>
                    <tr>
                        <th>#</th>
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
                        <th title="Action">
                            <div className="k-table-title">
                                <div className="k-table-title-text c-ellipsis">Action</div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(($value: any, $key: number) => {
                        return <tr key={$value.key}>
                            <td>{$key}</td>
                            <td>{firstName($value)}</td>
                            <td>{lastName($value)}</td>
                            <td>{age($value)}</td>
                            <td>{address($value)}</td>
                            <td>{action($value)}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        );
    }
}

export class ReactChildrenDemo extends ReactComponent {
    render() {
        return <div>{this.props.children}</div>
    }
}
