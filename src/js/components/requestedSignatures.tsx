import * as React from 'react';
import { connect } from 'react-redux';
import { requestRequestedSignatures, toggleToSignShowComplete } from '../actions';
import * as moment from 'moment';
import { stringToDateTime } from '../utils';
import { Link } from 'react-router';
import { Checkbox } from 'react-bootstrap';

interface RequestedSignatureProps {
    showComplete: boolean;
    requestRequestedSignatures: () => void;
    requestedSignatures: Sign.RequestedSignatures;
    documents: {
        [documentId: string]: Sign.Document
    };
    toggleShowComplete: () => void;
}

interface RequestedSignatureDocumentSetProps {
    documentSetId: string;
    requestDocumentSet: {
        [documentId: string]: {

        }
    }
}


interface ConnectedRequestedSignatureDocumentSetProps extends RequestedSignatureDocumentSetProps {
    documents: {
        [documentId: string]: Sign.Document
    },
    documentSet: Sign.DocumentSet
}

export const SignStatus = (props: {signStatus: Sign.SignStatus}) => {
    const status = props.signStatus || 'Pending';
    const className = {
        'Pending': 'text-warning',
        'Partial': 'text-warning',
        'Signed': 'text-success',
        'Rejected': 'text-danger'
    }[status];
    return <span className={`sign-status ${className}`}>{ status }</span>
}


class RequestedSignatureDocumentSet extends React.PureComponent<ConnectedRequestedSignatureDocumentSetProps>  {
    render() {
        const inviter = this.props.documentSet.owner === undefined ? this.props.documentSet.owner.name : 'A user';
        const documentSetLabel = stringToDateTime(this.props.documentSet.createdAt);

        return (
            <div className="request-signature">
                <div className="request-signature-title">
                    <span className="inviter">{ inviter }</span> has requested that you sign the following ({documentSetLabel}):
                </div>

                {Object.keys(this.props.requestDocumentSet).map((documentId: string, index: number) => {
                    const document : Sign.Document = this.props.documents[documentId]
                    const url = `/sign/${this.props.documentSetId}/${documentId}`;

                    return (
                        <div key={index} className="document-line">
                            <SignStatus signStatus={document.signStatus}/>
                            <Link to={url}><i className="fa fa-file-pdf-o" /> { document.filename }</Link>
                        </div>
                    );
                }) }
            </div>
        );
    }
}

const ConnectedRequestedSignatureDocumentSet = connect((state: Sign.State, ownProps: RequestedSignatureDocumentSetProps) => ({
    documentSet: state.documentSets[ownProps.documentSetId],
    documents: state.documents
}), {

})(RequestedSignatureDocumentSet);


class RequestedSignatures extends React.PureComponent<RequestedSignatureProps>  {
    componentDidMount() {
        this.props.requestRequestedSignatures();
    }

    render() {
        const docSets = this.props.requestedSignatures.documentSets;
        let docSetKeys = Object.keys(docSets);

        // Filter out complete document sets - if needed
        if (!this.props.showComplete) {
            docSetKeys = docSetKeys.filter((key: string) => {
                const docSet = docSets[key];
                const setComplete = Object.keys(docSet).every(docKey => this.props.documents[docKey].signStatus === Sign.SignStatus.SIGNED)

                return !setComplete;
            });
        }

        // TODO, spinner

        if (docSetKeys.length === 0) {
            return <h3>No pending signature requests.</h3>;
        }

        return (
            <div>
                <div className="page-heading"><h1 className="title">Documents To Sign</h1></div>

                <Checkbox onChange={this.props.toggleShowComplete}>Show Complete Sets</Checkbox>

                <hr />

                {docSetKeys.map((documentSetId: string, index: number) =>
                    <ConnectedRequestedSignatureDocumentSet key={index} documentSetId={documentSetId} requestDocumentSet={docSets[documentSetId]} />
                )}
            </div>
        );
    }
}

const ConnectedRequestedSignature = connect((state: Sign.State) => ({
    requestedSignatures: state.requestedSignatures,
    documents: state.documents,
    showComplete: state.toSignPage.showComplete
}), {
    requestRequestedSignatures,
    toggleShowComplete: toggleToSignShowComplete
})(RequestedSignatures);




export default ConnectedRequestedSignature;