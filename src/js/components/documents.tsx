import * as React from 'react';
import { Link } from 'react-router';

export default class Documents extends React.PureComponent {
    render() {
        return (
            <div>
                <div className="page-heading"><h1 className="title">Documents</h1></div>

                <div className="center-nav-pills">
                    <ul className="nav nav-pills">
                        <li><Link to="/all">All</Link></li>
                        <li><Link to="/to_sign">To Sign</Link></li>
                        <li><Link to="/pending">Pending</Link></li>
                        <li><Link to="/completed">Completed</Link></li>
                    </ul>
                </div>

                {this.props.children}
            </div>
        );
    }
}