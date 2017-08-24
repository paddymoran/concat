import  * as React from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router';



class Sidebar extends React.PureComponent<any> {
    render() {
        return <div className="side-menu">
            <ul>
            <li><Link to='/sign' activeClassName="active">Sign</Link>
                <ul>
                    <li><a>Only Me</a></li>
                    <li><a>Invite Others</a></li>
                </ul>
            </li>
            <li><a>Documents</a>
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

})(Sidebar)