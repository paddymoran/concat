import * as React from 'react';
import { connect } from 'react-redux';
import { requestRequestedSignatures,  showEmailDocumentsModal, toggleToSignShowComplete, showDownloadAllModal, startSigningSession } from '../actions';
import * as moment from 'moment';
import { stringToDateTime, fileSize } from '../utils';
import { Link } from 'react-router';
import { Checkbox } from 'react-bootstrap';


export function getNonCompletedRequestKeys(requestedSignatures: Sign.RequestedSignatures, documents: Sign.Documents ) {
    const documentSets = requestedSignatures.documentSets;
    let docSetKeys = Object.keys(documentSets);
    return  docSetKeys.filter((key: string) => {
        const docSet = documentSets[key];
        return  Object.keys(docSet).some(docKey => documents[docKey].requestStatus === Sign.SignStatus.PENDING)
    });
}

export function getCompletedRequestKeys(requestedSignatures: Sign.RequestedSignatures, documents: Sign.Documents ) {
    const documentSets = requestedSignatures.documentSets;
    let docSetKeys = Object.keys(documentSets);
    return  docSetKeys.filter((key: string) => {
        const docSet = documentSets[key];
       return  Object.keys(docSet).every(docKey => documents[docKey].requestStatus != Sign.SignStatus.PENDING)
    });
}

interface RequestedSignatureProps {
    showComplete: boolean;
    requestRequestedSignatures: () => void;
    requestedSignatures: Sign.RequestedSignatures;
    documents: {
        [documentId: string]: Sign.Document
    };
    toggleShowComplete: () => void;
    hasEmailVerified: boolean;
    title: string;
}

interface RequestedSignatureDocumentSetProps {
    documentSetId: string;
    showLink: boolean;
    requestDocumentSet: {
        [documentId: string]: {

        }
    }
}


interface ConnectedRequestedSignatureDocumentSetProps extends RequestedSignatureDocumentSetProps {
    showEmailDocumentsModal: (payload: Sign.Actions.ShowEmailDocumentsModalPayload) => void;
    downloadAll: (payload: Sign.Actions.ShowDownloadAllModalPayload) => void;
    sign: (payload: Sign.Actions.StartSigningSessionPayload) => void;
    documents: {
        [documentId: string]: Sign.Document
    },
    documentSet: Sign.DocumentSet,
}

export const SignStatus = (props: {signStatus: Sign.DocumentStatus | Sign.SignStatus}) => {
    const status = props.signStatus || 'Pending';
    const className = {
        'Pending': 'text-warning',
        'Partial': 'text-warning',
        'Signed': 'text-success',
        'Rejected': 'text-danger',
        'Complete': 'text-success'
    }[status];
    return <span className={`sign-status ${className}`}>{ status }</span>
}


class RequestedSignatureDocumentSet extends React.PureComponent<ConnectedRequestedSignatureDocumentSetProps>  {
    render() {
        const inviter = this.props.documentSet.owner === undefined ? 'A user' : this.props.documentSet.owner.name;
        const documentSetLabel = stringToDateTime(this.props.documentSet.createdAt);
        const showLink = this.props.showLink;
        return (
            <div className="document-set">
                <div className="document-set-title">
                    <span className="inviter">{ inviter }</span> has requested that you sign the following ({documentSetLabel}):
                </div>
                    <div>
                    <table className=" table table-hover">

                <thead></thead>
                <tbody>
                {Object.keys(this.props.requestDocumentSet).reduce((acc: any[], documentId: string, i: number) => {
                    const document : Sign.Document = this.props.documents[documentId];
                    const pending = document.requestStatus === Sign.SignStatus.PENDING; 

                    acc.push(<tr key={i}>
                                  <td className="status">
                                       <SignStatus signStatus={document.requestStatus}/>
                                  </td>
                                  <td className="filename-icon">
                                      <i className="fa fa-file-pdf-o" />
                                      </td>
                                  <td className="filename">
                                      {document.filename} ({fileSize(document.size)})
                                  </td>
                                  <td className="file-controls">
                                         <a className="btn btn-default btn-sm" target="_blank" href={`/api/document/${documentId}`}>
                                            <i className="fa fa-download"/> Download
                                        </a>
                                        <a className="btn btn-default btn-sm" onClick={() => this.props.showEmailDocumentsModal({ documentIds: [documentId] })}>
                                            <i className="fa fa-send"/> Email
                                        </a>
                                        { showLink && pending && <a className="btn btn-primary btn-sm" onClick={() => this.props.sign({documentSetId: this.props.documentSetId, documentId})}><i className="fa fa-pencil-square-o"/>Review & Sign</a> }
                                  </td>


                            </tr>);
                    if(document.rejectedMessage){
                        acc.push(
                            <tr key={`signed-${i}`} className="rejection-info condensed">
                                <td/>
                                <td/>
                                <td colSpan={2}>Rejected with message: "{document.rejectedMessage}"</td>
                            </tr>)
                    }
                    else if(document.acceptedMessage){
                        acc.push(
                            <tr key={`signed-${i}`} className="signed-info condensed">
                                <td/>
                                <td/>
                                <td colSpan={2}>Signed with message: "{document.acceptedMessage}"</td>
                            </tr>)
                    }
                    return acc;
                }, []) }
                </tbody>
                </table>
            </div>
            </div>
        );
    }
}

const ConnectedRequestedSignatureDocumentSet = connect((state: Sign.State, ownProps: RequestedSignatureDocumentSetProps) => ({
    documentSet: state.documentSets[ownProps.documentSetId],
    documents: state.documents
}), {
showEmailDocumentsModal, downloadAll: showDownloadAllModal, sign: startSigningSession
})(RequestedSignatureDocumentSet);


class RequestedSignatures extends React.PureComponent<RequestedSignatureProps>  {
    componentDidMount() {
        this.props.requestRequestedSignatures();
    }

    render() {
        const { hasEmailVerified } = this.props;
        const docSets = this.props.requestedSignatures.documentSets;
        let docSetKeys = Object.keys(docSets);
        const loaded = this.props.requestedSignatures.downloadStatus === Sign.DownloadStatus.Complete;
        if (!this.props.showComplete) {
            docSetKeys = getNonCompletedRequestKeys(this.props.requestedSignatures, this.props.documents);
        }
        else{
            docSetKeys = getCompletedRequestKeys(this.props.requestedSignatures, this.props.documents);
        }
        return (

            <div className="document-set-list">
               { !hasEmailVerified && <div className="alert alert-danger">
                       You must verify your email address before you can respond to a sign request.  Click <a href='/verify_email'>here</a> here for more information.
                </div>  }

                { !loaded && <p>Loading { this.props.title } signature requests... </p> }
                { loaded && docSetKeys.length === 0 && <p>No { this.props.title } signature requests.</p> }

                { docSetKeys.map((documentSetId: string, index: number) =>
                    <ConnectedRequestedSignatureDocumentSet key={index} documentSetId={documentSetId}  requestDocumentSet={docSets[documentSetId]} showLink={hasEmailVerified && !this.props.showComplete} />
                )}
            </div>
        );
    }
}

export const RequestedSignaturesPending = connect((state: Sign.State) => ({
    requestedSignatures: state.requestedSignatures,
    documents: state.documents,
    hasEmailVerified: state.user.emailVerified,
    showComplete: false,
    title: 'pending'
}), {
    requestRequestedSignatures,
    toggleShowComplete: toggleToSignShowComplete
})(RequestedSignatures);


export const RequestedSignaturesComplete = connect((state: Sign.State) => ({
    requestedSignatures: state.requestedSignatures,
    documents: state.documents,
    hasEmailVerified: state.user.emailVerified,
    showComplete: true,
    title: 'completed'
}), {
    requestRequestedSignatures,
    toggleShowComplete: toggleToSignShowComplete
})(RequestedSignatures);

