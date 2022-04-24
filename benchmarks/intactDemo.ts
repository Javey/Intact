import { Component as IntactReactComponent, compile } from 'intact-react';
import { Component as IntactVueComponent} from 'intact-vue-next';
import { Component } from 'intact';

const template = compile(`
    // const {data, firstName, lastName, age, address, action} = this.get();
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
            <tr v-for={this.get('data')} key={$value.key}>
                <td>{$key}</td>
                <td><b:first-name params={$value} /></td>
                <td><b:last-name params={$value} /></td>
                <td><b:age params={$value} /></td>
                <td><b:address params={$value} /></td>
                <td><b:action params={$value} /></td>
            </tr>
        </tbody>
    </table>
`);
                // <td>{lastName($value)}</td>
                // <td>{age($value)}</td>
                // <td>{address($value)}</td>
                // <td>{action($value)}</td>


export class IntactReactDemo extends IntactReactComponent<any> {
    static template = template;
}

export class IntactVueDemo extends IntactVueComponent<any> {
    static template = template;
}

export class IntactReactChildrenDemo extends IntactReactComponent {
    static template = compile(`<div>{this.get('children')}</div>`)
}

export class IntactDemo extends Component {
    static template = compile(`<div>test</div>`);
}



