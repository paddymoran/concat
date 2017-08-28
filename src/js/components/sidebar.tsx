import  * as React from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { generateUUID } from './uuid';

interface SidebarProps {
    pathname: string;
}

interface ConnectedSidebarProps extends SidebarProps{
    openSign: () => void;
}


class Sidebar extends React.PureComponent<ConnectedSidebarProps> {
    render() {
        return <div className="side-menu">
            <ul>
            <li><a className={this.props.pathname.indexOf('/upload') === 0 ? 'active' : ''} onClick={() => generateUUID().then(this.props.openSign)}>Sign</a>
            </li>
            <li><Link to='/all' activeClassName="active">Documents</Link>
                <ul>
                    <li><Link to='/to_sign' activeClassName="active">To Sign</Link></li>
                    <li><Link to='/pending' activeClassName="active">Pending</Link></li>
                    <li><Link to='/completed' activeClassName="active">Signed</Link></li>
                </ul>

            </li>
            <li><Link to='/faq' activeClassName="active">FAQ</Link></li>
            </ul>

        </div>
    }
}


export default connect<{}, {}, SidebarProps>((state: Sign.State) => ({

}), {
        openSign: (uuid: string) => push(`/upload/${uuid}`),
})(Sidebar)