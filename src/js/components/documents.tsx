import * as React from 'react';
import { Link } from 'react-router';

export default class Documents extends React.PureComponent {
    render() {
        return (
            <div>
                <div className="page-heading"><h1 className="title">Documents</h1></div>

                <div className="center-nav-pills">
                    <ul className="nav nav-pills">
                        <li><Link to="/to_sign"  activeClassName="active">For Me to Sign</Link></li>
                        <li><Link to="/signed"  activeClassName="active">Signed For Others</Link></li>
                        <li><Link to="/pending"  activeClassName="active">My Pending Documents</Link></li>
                        <li><Link to="/completed"  activeClassName="active">My Completed Documents</Link></li>
                    </ul>
                </div>

                {this.props.children}
            </div>
        );
    }
}