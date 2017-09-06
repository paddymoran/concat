import * as React from 'react';
import { connect } from 'react-redux';
import { requestDocumentSets, showEmailDocumentModal } from '../actions';
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


class UnconnectedCompletedDocumentSets extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    render() {

        const keys = Object.keys(this.props.documentSets).filter((setId: string) => {
            return this.props.documentSets[setId].documentIds.every(d => this.props.documents[d].signStatus === 'Signed')
        });

        return (
            <div>
                <div className="document-set-list">
                    { keys.map(documentSetId => <DocumentSetList key={documentSetId} documentSetId={documentSetId} />)}
                </div>
            </div>
        );
    }
}

interface UnconnectedDocumentSetListProps {
    documentSetId: string;
}

interface DocumentSetListProps extends UnconnectedDocumentSetListProps {
    documentSet: Sign.DocumentSet;
    documents: Sign.Documents;
    emailDocument: (id: string) => void;
}

class UnconnectedDocumentSetList extends React.PureComponent<DocumentSetListProps> {

    emailDocument(id: string) {
        this.props.emailDocument(id);
    }

    render() {
        const documentSetLabel = stringToDateTime(this.props.documentSet.createdAt);
        return (
            <div className="document-set">
                <div className="document-set-title">{documentSetLabel}</div>

                {this.props.documentSet.documentIds.map((documentId, i : number) => {
                    const document = this.props.documents[documentId]
                    if(documentId === 'a75a79af-cb58-434c-8c07-ebe6f546a133') {
                        //debugger;
                    }
                    return (
                        <div key={i} className="document-line">
                            <SignStatus signStatus={document.signStatus}/>
                            <i className="fa fa-file-pdf-o" />{document.filename}
                            <a className="btn btn-default btn-xs" target="_blank" href={`/api/document/${documentId}`}><i className="fa fa-download"/>Download</a>
                            <a className="btn btn-default btn-xs" onClick={() => this.emailDocument(documentId) }><i className="fa fa-send"/>Email</a>
                        </div>
                    );
                })}
            </div>
        );
    }
}

const DocumentSetList = connect(
    (state: Sign.State, ownProps: UnconnectedDocumentSetListProps) => ({
        documents: state.documents,
        documentSet: state.documentSets[ownProps.documentSetId]
    }), {
         emailDocument: showEmailDocumentModal
    }
)(UnconnectedDocumentSetList);

class UnconnectedPendingDocumentSets extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    render() {
        const keys = Object.keys(this.props.documentSets).filter((setId: string) => {
            return this.props.documentSets[setId].documentIds.some(d => this.props.documents[d].signStatus === 'Pending')
        });
        return (
            <div>
                <div className="document-set-list">
                    { keys.map(documentSetId => <DocumentSetList key={documentSetId} documentSetId={documentSetId} />) }
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
    documentSets: state.documentSets, //.filter(set => !set.status),
    documents: state.documents
}), {
    showEmailDocumentModal,  requestDocumentSets
})(UnconnectedPendingDocumentSets);

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
