import  * as React from "react";
import { connect } from 'react-redux';
import { requestUsage } from '../actions';

interface StatusBarProps {

}

interface ConnectedStatusBarProps extends StatusBarProps{
    requestUsage: () => void;
    usage: Sign.Usage
}


class StatusBar extends React.PureComponent<ConnectedStatusBarProps> {
    componentDidMount() {
        this.props.requestUsage();
    }

    componentDidUpdate() {
        this.props.requestUsage();
    }

    renderUsage() {
        if(this.props.usage.amountPerUnit !== null){
            return <div className="status-message">You have used <strong>{ this.props.usage.requestedThisUnit + this.props.usage.signedThisUnit }</strong> of your <strong>{ this.props.usage.amountPerUnit }</strong> free signs this { this.props.usage.unit }.
            Click <a href="#">here</a> to upgrade your account.</div>
        }
        else{
            return <div className="status-message">You have signed or requested the signing of <strong>{ this.props.usage.requestedThisUnit + this.props.usage.signedThisUnit }</strong> documents this { this.props.usage.unit }</div>
        }
    }

    render() {
        return <div className="status-bar">
        <div className="container">
            { this.props.usage.status === Sign.DownloadStatus.Complete && this.renderUsage() }
        </div>
        </div>
    }
}


export default connect<{}, {}, StatusBarProps>((state: Sign.State) => ({
    usage: state.usage
}), {
    requestUsage
})(StatusBar)