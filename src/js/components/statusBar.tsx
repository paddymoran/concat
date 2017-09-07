import  * as React from "react";
import { connect } from 'react-redux';
import { requestUsage, requestRequestedSignatures } from '../actions';
import { getNonCompletedRequestKeys } from './requestedSignatures';
import { Link } from 'react-router';


interface StatusBarProps {

}

interface ConnectedStatusBarProps extends StatusBarProps{
    requestUsage: () => void;
    requestRequestedSignatures: () => void;
    usage: Sign.Usage;
    requestedSignatures: Sign.RequestedSignatures;
    documents: Sign.Documents;
}


class StatusBar extends React.PureComponent<ConnectedStatusBarProps> {
    componentDidMount() {
        this.props.requestUsage();
        this.props.requestRequestedSignatures();
    }

    componentDidUpdate() {
        this.props.requestUsage();
        this.props.requestRequestedSignatures();
    }

    renderUsage() {
        if(this.props.usage.amountPerUnit !== null){
            return <span className="status-message">You have used <strong>{ this.props.usage.requestedThisUnit + this.props.usage.signedThisUnit }</strong> of your <strong>{ this.props.usage.amountPerUnit }</strong> free signs this { this.props.usage.unit }.
            Click <a href="/signup">here</a> to upgrade your account.</span >
        }
        else{
            return false;
        }
    }

    renderRequested() {
        const count = getNonCompletedRequestKeys(this.props.requestedSignatures, this.props.documents).length;
        if(count > 0){
            return <span  className="status-message">You have documents that require signing, click <Link to='/to_sign'>here</Link> to view.</span>
        }
    }

    render() {
        return <div className="status-bar">
        <div className="container">
            { this.props.usage.status === Sign.DownloadStatus.Complete && this.renderUsage() }
            { this.props.requestedSignatures.downloadStatus === Sign.DownloadStatus.Complete && this.renderRequested() }
        </div>
        </div>
    }
}


export default connect<{}, {}, StatusBarProps>((state: Sign.State) => ({
    usage: state.usage,
    requestedSignatures: state.requestedSignatures,
    documents: state.documents
}), {
    requestUsage, requestRequestedSignatures
})(StatusBar)