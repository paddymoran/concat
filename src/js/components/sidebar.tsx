import  * as React from "react";
import { connect } from 'react-redux';


class Sidebar extends React.PureComponent<any> {
    render() {
        return <div className="side-menu">
            <ul>
            <li><a>Sign</a>
                <ul>
                    <li><a>Only Me</a></li>
                    <li><a>Invite Others</a></li>
                </ul>
            </li>
            <li><a>Documents</a></li>
            <li><a>Help</a></li>
            </ul>

        </div>
    }
}


export default connect((state: Sign.State) => ({

}), {

})(Sidebar)