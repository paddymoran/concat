import * as React from 'react';
import { Link } from 'react-router';

export default class Documents extends React.PureComponent {
    render() {
        return (
            <div>
                <div className="page-heading"><h1 className="title">Documents</h1></div>

                <div className="row">
                    <div className="col-sm-3 documents-nav">
                        <ul>
                            <li>
                                <ul>
                                    <li>Requested Signatures</li>
                                    <li><Link to="/to_sign"  activeClassName="active">To Sign</Link></li>
                                    <li><Link to="/signed"  activeClassName="active">Completed</Link></li>
                                </ul>
                            </li>
                            <li>
                                <ul>
                                    <li>My Documents</li>
                                    <li><Link to="/pending"  activeClassName="active">Waiting on Others</Link></li>
                                    <li><Link to="/completed"  activeClassName="active">Completed</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <div className="col-sm-9">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}