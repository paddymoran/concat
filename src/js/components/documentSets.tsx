import * as React from 'react';
import { connect } from 'react-redux';
import { requestDocumentSets, showEmailDocumentsModal, revokeSignInvitation, deleteDocument, deleteDocumentSet, showDownloadAllModal } from '../actions';
import * as moment from 'moment';
import { Link } from 'react-router';
import { Nav, NavItem } from 'react-bootstrap';
import { stringToDateTime, fileSize } from '../utils';
import { SignStatus } from './requestedSignatures';


interface DocumentSets {
    requestDocumentSets: () => void;
    documents: Sign.Documents,
    documentSets: Sign.DocumentSets
}

interface BufferedDocumentSets {
    requestDocumentSets: () => void;
    documents: Sign.Documents,
    documentSets: Sign.DocumentSets,
    filter: (documentSets: Sign.DocumentSets, documents: Sign.Documents) => string[],
    documentSetsStatus: Sign.DownloadStatus
}

function statusComplete(status : string) {
    return status === 'Complete'
}



interface UnconnectedDocumentSetListProps {
    showDownloadAll?: boolean;
    documentSet: Sign.DocumentSet;
    documents: Sign.Documents;
    documentSetId: string;
    showNotFound?: boolean;
}

interface DocumentSetListProps extends UnconnectedDocumentSetListProps {
    downloadAll: (payload: Sign.Actions.ShowDownloadAllModalPayload) => void;
    emailDocuments: (payload: Sign.Actions.ShowEmailDocumentsModalPayload) => void;
    revokeSignInvitation: (payload: Sign.Actions.RevokeSignInvitationPayload) => void;
    deleteDocument: (payload: Sign.Actions.DeleteDocumentPayload) => void;
    deleteDocumentSet: (payload: Sign.Actions.DeleteDocumentSetPayload) => void;
}

class UnconnectedDocumentSetList extends React.PureComponent<DocumentSetListProps> {
    constructor(props: DocumentSetListProps) {
        super(props);
        this.deleteSet = this.deleteSet.bind(this);
    }

    deleteSet() {
        this.props.deleteDocumentSet({ documentSetId: this.props.documentSetId });
    }

    render() {
        if(!this.props.documentSet || !this.props.documentSet.documentIds.length){
            if(this.props.showNotFound) {
                return <p >This document set does not exist.</p>
            }
            return false;
        }
        const documentSetLabel = stringToDateTime(this.props.documentSet.createdAt);
        const hasDownloadAll =  this.props.showDownloadAll && this.props.documentSet.documentIds.length > 1;
        const hasEmailAll =  this.props.documentSet.documentIds.length > 1;
        const hasDeleteAll =  this.props.documentSet.isOwner && this.props.documentSet.documentIds.length > 1;
        const hasSetControls = hasDownloadAll || hasDeleteAll;

        return (
            <div className="document-set">
                <div className="document-set-title">{documentSetLabel}</div>
                    <div >
                    <table className=" table table-hover">
                        <thead></thead>

                        <tbody>
                        {this.props.documentSet.documentIds.reduce((rows: any, documentId, i : number) => {
                            const document = this.props.documents[documentId];

                            rows.push(
                                <tr key={i}>
                                    <td className="status">
                                        <SignStatus signStatus={document.signStatus} />
                                    </td>

                                    <td className="filename-icon">
                                        <i className="fa fa-file-pdf-o" />
                                    </td>

                                    <td className="filename">{document.filename} ({fileSize(document.size)})</td>

                                    <td className="file-controls">
                                        <a className="btn btn-default btn-sm" target="_blank" href={`/api/document/${documentId}`}>
                                            <i className="fa fa-download"/> Download
                                        </a>
                                        <a className="btn btn-default btn-sm" onClick={() => this.props.emailDocuments({ documentIds: [documentId] })}>
                                            <i className="fa fa-send"/> Email
                                        </a>
                                        {this.props.documentSet.isOwner &&
                                            <a className="btn btn-default btn-sm" onClick={() => this.props.deleteDocument({ documentId })}>
                                                <i className="fa fa-trash"/> Delete
                                            </a>
                                        }
                                        { this.props.documentSet.isOwner && !document.signatureRequestInfos && !statusComplete(document.signStatus) &&
                                           <Link className="btn btn-primary btn-sm" to={`/documents/${this.props.documentSetId}/${documentId}`}><i className="fa fa-pencil-square-o"/>Sign</Link>
                                        }

                                    </td>
                                </tr>
                            );

                            document.signatureRequestInfos && document.signatureRequestInfos.map((r: Sign.SignatureRequestInfo, i: number) => {
                                const keyModifier = `${documentId}-${r.signRequestId}-${i}`;

                                if (r.status === 'Rejected') {
                                    const string = r.rejectedMessage ? `Rejected by ${r.name} - "${r.rejectedMessage}"` : `Rejected by ${r.name}`;
                                    rows.push(
                                        <tr key={`rejection-${keyModifier}`} className="rejection-info condensed">
                                            <td/>
                                            <td/>
                                            <td><i className="fa fa-times" /> { string }</td>
                                        </tr>
                                    );
                                }
                                else if (r.status === 'Pending') {
                                    rows.push(
                                        <tr key={`pending-${keyModifier}`} className="pending-info condensed">
                                            <td/>
                                            <td/>
                                            <td >Waiting on { r.name }</td>
                                            <td className="file-controls">
                                                <a className="btn btn-default btn-sm" onClick={() => this.props.revokeSignInvitation({ signRequestId: r.signRequestId })}>
                                                    <i className="fa fa-trash" /> Revoke
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                }
                                else {
                                     const string = r.acceptedMessage ? `Signed by ${r.name} - "${r.acceptedMessage}"` : `Signed by ${r.name}`;
                                    rows.push(
                                        <tr key={`signed-${keyModifier}`} className="signed-info condensed">
                                            <td/>
                                            <td/>
                                            <td colSpan={2}><i className="fa fa-check" /> { string }</td>
                                        </tr>
                                    );
                                }

                            });
                            return rows;
                        }, []) }

                        { hasSetControls &&
                            <tr className="document-set-controls">
                                <td colSpan={4} className="text-center">
                                    {hasDownloadAll &&
                                        <a className="btn btn-default btn-sm" onClick={() => this.props.downloadAll({ documentSetId: this.props.documentSetId }) }>
                                            <i className="fa fa-download" /> Download All
                                        </a>
                                    }
                                    { hasEmailAll &&
                                        <a className="btn btn-default btn-sm" onClick={() => this.props.emailDocuments({ documentIds: this.props.documentSet.documentIds })}>
                                            <i className="fa fa-send" /> Email All
                                        </a>
                                    }

                                    {hasDeleteAll &&
                                        <a className="btn btn-default btn-sm" onClick={this.deleteSet}>
                                            <i className="fa fa-trash" /> Delete All
                                        </a>

                                    }
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            </div>
        );
    }
}

const DocumentSetList = connect<{}, {}, UnconnectedDocumentSetListProps>(() => ({
        showNotFound: false
    }),
    { emailDocuments: showEmailDocumentsModal, revokeSignInvitation, deleteDocument, deleteDocumentSet, downloadAll: showDownloadAllModal }
)(UnconnectedDocumentSetList);


class UnconnectedBufferedDocumentSets extends React.PureComponent<BufferedDocumentSets, {documents: Sign.Documents, documentSets: Sign.DocumentSets}>  {
    constructor(props: BufferedDocumentSets) {
        super(props);
        this.state = {documents: props.documents, documentSets: props.documentSets}
    }
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    componentDidUpdate() {
        this.props.requestDocumentSets()
    }
    componentWillReceiveProps(newProps: BufferedDocumentSets) {
        if(newProps.documentSetsStatus === Sign.DownloadStatus.Complete) {
            this.setState({documents: newProps.documents, documentSets: newProps.documentSets})
        }
    }
    render() {
        const keys = this.props.filter(this.state.documentSets, this.state.documents).sort((a, b) => {
            return moment(this.state.documentSets[b].createdAt).valueOf() - moment(this.state.documentSets[a].createdAt).valueOf()
        });
        return (
            <div className="row">
                <div className="col-md-12">
                <div className="document-set-list">
                    { keys.map(documentSetId => <DocumentSetList
                        key={documentSetId}
                        documentSetId={documentSetId}
                        documentSet={this.state.documentSets[documentSetId]}
                        documents={this.state.documents}
                        showDownloadAll={true} />) }
                </div>
                </div>
            </div>
        );
    }
}


class UnconnectedDocumentSet extends React.PureComponent<{documentSetId: string, documents: Sign.Documents, documentSet: Sign.DocumentSet, requestDocumentSets: () => void;}>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    componentDidUpdate() {
        this.props.requestDocumentSets()
    }
    render() {
        const { documentSetId } = this.props;
        return (
            <div className="row">
                <div className="col-md-12">
                <div className="document-set-list">
                     <DocumentSetList documentSetId={this.props.documentSetId}
                            documentSet={this.props.documentSet}
                            documents={this.props.documents}

                     showDownloadAll={true} />
                </div>
                </div>
            </div>
        );
    }
}


export const PendingDocumentSets = connect((state: Sign.State) => ({
    documentSets: state.documentSets,
    documents: state.documents,
    documentSetsStatus: state.documentSetsStatus,
    filter: (documentSets: Sign.DocumentSets, documents: Sign.Documents) : string[] => {
        return Object.keys(documentSets).filter((setId: string) => documentSets[setId].isOwner && documentSets[setId].documentIds.some(d => !statusComplete(documents[d].signStatus)))
    }
}), {
    showEmailDocumentsModal, requestDocumentSets
})(UnconnectedBufferedDocumentSets);


export const CompletedDocumentSets = connect((state: Sign.State) => ({
    documentSets: state.documentSets,
    documents: state.documents,
    documentSetsStatus: state.documentSetsStatus,
    filter: (documentSets: Sign.DocumentSets, documents: Sign.Documents) : string[] => {
        return Object.keys(documentSets).filter((setId: string) => {
            return documentSets[setId].isOwner && documentSets[setId].documentIds.every(d => statusComplete(documents[d].signStatus))
        })
    }
}), {
    showEmailDocumentsModal,  requestDocumentSets
})(UnconnectedBufferedDocumentSets);

export const DocumentSet = connect(
    (state: Sign.State, ownProps: any) => ({
        documentSetId: ownProps.params.documentSetId,
        documentSet: state.documentSets[ownProps.params.documentSetId],
        documents: state.documents,
    }),
    { showEmailDocumentsModal, requestDocumentSets }
)(UnconnectedDocumentSet);

export class AllDocumentSets extends React.PureComponent<DocumentSets>  {
    render() {
        return (
            <div>
                <PendingDocumentSets />
                <CompletedDocumentSets />
            </div>
        );
    }
}
