import * as React from 'react';
import { Link } from 'react-router';

export default class Documents extends React.PureComponent {
    render() {
        return (
            <div>
                <div className="page-heading"><h1 className="title">Documents</h1></div>

                <div className="row">
                    <div className="col-sm-3 documents-nav">
                        <div className="documents-nav-section">
                            <div className="documents-nav-title">Requested Signatures</div>
                            <ul>
                                <li><Link to="/to_sign"  activeClassName="active">To Sign</Link></li>
                                <li><Link to="/signed"  activeClassName="active">Completed</Link></li>
                            </ul>
                        </div>

                        <div className="documents-nav-section">
                            <div className="documents-nav-title">My Documents</div>
                            <ul>
                                <li><Link to="/pending"  activeClassName="active">Pending</Link></li>
                                <li><Link to="/completed"  activeClassName="active">Completed</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-sm-9">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}