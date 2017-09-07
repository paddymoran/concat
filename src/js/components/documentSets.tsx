import * as React from 'react';
import { connect } from 'react-redux';
import { requestDocumentSets, showEmailDocumentModal, revokeSignInvitation, deleteDocument, deleteDocumentSet } from '../actions';
import * as moment from 'moment';
import { Link } from 'react-router';
import { Nav, NavItem } from 'react-bootstrap';
import { stringToDateTime } from '../utils';
import { SignStatus } from './requestedSignatures';


interface DocumentSets {
    requestDocumentSets: () => void;
    documents: Sign.Documents,
    documentSets: Sign.DocumentSets
}

function statusComplete(status : string) {
    return ['Signed', 'Rejected'].indexOf(status) >= 0
}



interface UnconnectedDocumentSetListProps {
    documentSetId: string;
    showDownloadAll?: boolean;
}

interface DocumentSetListProps extends UnconnectedDocumentSetListProps {
    documentSet: Sign.DocumentSet;
    documents: Sign.Documents;
    emailDocument: (payload: Sign.Actions.ShowEmailDocumentModalPayload) => void;
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
        if(!this.props.documentSet){
            return false;
        }
        const documentSetLabel = stringToDateTime(this.props.documentSet.createdAt);
        const hasDownloadAll =  this.props.showDownloadAll && this.props.documentSet.documentIds.length > 1;
        const hasDeleteAll =  this.props.documentSet.isOwner
        const hasSetControls = hasDownloadAll || hasDeleteAll;

        return (
            <div className="document-set">
                <div className="document-set-title">{documentSetLabel}</div>
                    <table className="table-hover">
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

                                    <td className="filename">{document.filename}</td>

                                    <td className="file-controls">
                                        <a className="btn btn-default btn-xs" target="_blank" href={`/api/document/${documentId}`}>
                                            <i className="fa fa-download"/> Download
                                        </a>
                                        <a className="btn btn-default btn-xs" onClick={() => this.props.emailDocument({ documentId })}>
                                            <i className="fa fa-send"/> Email
                                        </a>
                                        {this.props.documentSet.isOwner &&
                                            <a className="btn btn-default btn-xs" onClick={() => this.props.deleteDocument({ documentId })}>
                                                <i className="fa fa-trash"/> Delete
                                            </a>
                                        }
                                    </td>
                                </tr>
                            );

                            document.signatureRequestInfos && document.signatureRequestInfos.map((r: Sign.SignatureRequestInfo, i: number) => {
                                const keyModifier = `${documentId}-${r.signRequestId}-${i}`;

                                if (r.status === 'Rejected') {
                                    const string = r.rejectMessage ? `Rejected by ${r.name} - "${r.rejectMessage}"` : `Rejected by ${r.name}`;
                                    rows.push(
                                        <tr key={`rejection-${keyModifier}`} className="rejection-info condensed">
                                            <td/>
                                            <td/>
                                            <td>{ string }</td>
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
                                                <a className="btn btn-default btn-xs" onClick={() => this.props.revokeSignInvitation({ signRequestId: r.signRequestId })}>
                                                    <i className="fa fa-trash" /> Revoke
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                }
                                else {
                                    rows.push(
                                        <tr key={`signed-${keyModifier}`} className="signed-info condensed">
                                            <td/>
                                            <td/>
                                            <td colSpan={2}>Signed by { r.name }</td>
                                        </tr>
                                    );
                                }

                            });
                            return rows;
                        }, []) }

                        {hasSetControls &&
                            <tr className="document-set-controls">
                                <td/>
                                <td/>
                                <td colSpan={2}>
                                    {hasDownloadAll &&
                                        <a className="btn btn-default btn-xs" target="_blank" href={`/api/download_set/${this.props.documentSetId}`}>
                                            <i className="fa fa-download" /> Download All
                                        </a>
                                    }

                                    {hasDeleteAll &&
                                        <a className="btn btn-default btn-xs" onClick={this.deleteSet}>
                                            <i className="fa fa-trash" /> Delete All
                                        </a>
                                    }
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

const DocumentSetList = connect(
    (state: Sign.State, ownProps: UnconnectedDocumentSetListProps) => ({
        documents: state.documents,
        documentSet: state.documentSets[ownProps.documentSetId]
    }),
    { emailDocument: showEmailDocumentModal, revokeSignInvitation, deleteDocument, deleteDocumentSet }
)(UnconnectedDocumentSetList);

class UnconnectedCompletedDocumentSets extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    componentDidUpdate() {
        this.props.requestDocumentSets()
    }
    render() {

        const keys = Object.keys(this.props.documentSets).filter((setId: string) => {
            return this.props.documentSets[setId].documentIds.every(d => statusComplete(this.props.documents[d].signStatus))
        });

        return (
            <div className="row">
                <div className="col-md-12">
                <div className="document-set-list">
                    { keys.map(documentSetId => <DocumentSetList key={documentSetId} documentSetId={documentSetId} showDownloadAll={true}/>)}
                </div>
            </div>
            </div>
        );
    }
}

class UnconnectedPendingDocumentSets extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    componentDidUpdate() {
        this.props.requestDocumentSets()
    }
    render() {
        const keys = Object.keys(this.props.documentSets).filter((setId: string) => {
            return this.props.documentSets[setId].documentIds.some(d => !statusComplete(this.props.documents[d].signStatus))
        }).sort((a, b) => {
            return moment(this.props.documentSets[b].createdAt).valueOf() - moment(this.props.documentSets[a].createdAt).valueOf()
        })
        return (
            <div className="row">
                <div className="col-md-12">
                <div className="document-set-list">
                    { keys.map(documentSetId => <DocumentSetList key={documentSetId} documentSetId={documentSetId} showDownloadAll={true} />) }
                </div>
                </div>
            </div>
        );
    }
}

class UnconnectedDocumentSet extends React.PureComponent<{documentSetId: string, requestDocumentSets: () => void;}>  {
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
                     <DocumentSetList documentSetId={documentSetId} showDownloadAll={true} />
                </div>
                </div>
            </div>
        );
    }
}



export const CompletedDocumentSets = connect((state: Sign.State) => ({
    documentSets: state.documentSets,
    documents: state.documents
}), {
    showEmailDocumentModal, requestDocumentSets
})(UnconnectedCompletedDocumentSets);

export const PendingDocumentSets = connect((state: Sign.State) => ({
    documentSets: state.documentSets,
    documents: state.documents
}), {
    showEmailDocumentModal,  requestDocumentSets
})(UnconnectedPendingDocumentSets);

export const DocumentSet = connect(
    (state: Sign.State, ownProps: any) => ({
        documentSetId: ownProps.params.documentSetId
    }),
    { showEmailDocumentModal, requestDocumentSets }
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
