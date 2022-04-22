import { Component as ReactComponent} from 'react';

export class ReactDemo extends ReactComponent<any> {
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
                        <th title="Action">
                            <div className="k-table-title">
                                <div className="k-table-title-text c-ellipsis">Action</div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {props.data.map(($value: any) => {
                        return <tr key={$value.key}>
                            <td>{$value.firstName}</td>
                            <td>{$value.lastName}</td>
                            <td>{$value.age}</td>
                            <td>{$value.address}</td>
                            <td>{props.children}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        );
    }
}

