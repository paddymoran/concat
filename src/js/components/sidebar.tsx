import  * as React from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { generateUUID } from './uuid';


interface SidebarProps {
    openSelfSign: () => void;
    openOthersSign: () => void;
}


class Sidebar extends React.PureComponent<SidebarProps> {
    render() {
        return <div className="side-menu">
            <ul>
            <li><Link to='/sign' activeClassName="active">Sign</Link>
                <ul>
                    <li><a onClick={() => generateUUID().then(this.props.openSelfSign)}>Only Me</a></li>
                    <li><a onClick={() => generateUUID().then(this.props.openOthersSign)}>Invite Others</a></li>
                </ul>
            </li>
            <li><Link to='/all' activeClassName="active">Documents</Link>
                <ul>
                    <li><Link to='/pending' activeClassName="active">To Sign</Link></li>
                    <li><Link to='/completed' activeClassName="active">Signed</Link></li>
                </ul>

            </li>
            <li><Link to='/help' activeClassName="active">Help</Link></li>
            </ul>

        </div>
    }
}


export default connect((state: Sign.State) => ({

}), {
        openSelfSign: (uuid: string) => push(`/self_sign/${uuid}`),
        openOthersSign: (uuid: string) => push(`/others_sign/${uuid}`),
})(Sidebar)