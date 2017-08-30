import * as React from 'react';
import * as ReactDOM from "react-dom";
import { CSSTransitionGroup } from 'react-transition-group';
import PDFPage from './pdf/page';
import { connect } from 'react-redux';
import { showEmailDocumentModal } from '../actions';
import { Link } from 'react-router';
import { findSetForDocument } from '../utils';
import { DragSource, DropTarget } from 'react-dnd';
import { Col, Button } from 'react-bootstrap';

interface DocumentViewProps {
    documentId: string;
}

interface ConnectedDocumentViewProps extends DocumentViewProps {
    document: Sign.Document;
    documentSetId: string;
    showEmailDocumentModal: (payload: Sign.Actions.ShowEmailDocumentModalPayload) => void;
}

interface DocumentListProps {
    documentSetId: string;
}

interface ConnectedDocumentListProps extends DocumentListProps{
    documentIds: string[];
};

const THUMBNAIL_WIDTH = 150;


class DocumentView extends React.PureComponent<ConnectedDocumentViewProps> {
    constructor(props: ConnectedDocumentViewProps) {
        super(props);

        this.emailDocument = this.emailDocument.bind(this);
    }

    emailDocument() {
        this.props.showEmailDocumentModal({
            documentId: this.props.documentId
        });
    }

    render() {
        return (
            <div className="document row">
                <Col sm={3} md={2}>
                    <PDFPage className="preview" pageNumber={0} drawWidth={THUMBNAIL_WIDTH} documentId={this.props.documentId} showLoading={false} />
                </Col>

                <Col sm={6} md={7}>
                    <h3>{ this.props.document && this.props.document.filename ? this.props.document.filename : '' }</h3>
                </Col>

                <Col sm={3}>
                    <Link to={`/documents/${this.props.documentSetId}/${this.props.documentId}`} className="btn btn-default btn-block"><i className="fa fa-pencil" /> Sign</Link>
                    <a target="_blank" href={`/api/document/${this.props.documentId}`} className="btn btn-default btn-block"><i className="fa fa-download" /> Download</a>
                    <Button block onClick={this.emailDocument}><i className="fa fa-envelope-o" /> Email</Button>
                </Col>
            </div>
        );
    }
}

const ConnectedDocumentView = connect(
    (state: Sign.State, ownProps: DocumentViewProps) => ({
        document: state.documents[ownProps.documentId],
        documentSetId: findSetForDocument(state.documentSets, ownProps.documentId)
    }),
    { showEmailDocumentModal }
)(DocumentView);


class DocumentList extends React.PureComponent<ConnectedDocumentListProps> {
    render() {
        return (
            <div className="document-set">
                {this.props.documentIds.map(documentId => <ConnectedDocumentView key={documentId} documentId={documentId} />)}
            </div>
        );
    }
}

export default connect(
    (state: Sign.State, ownProps: DocumentListProps) => ({
        documentIds: state.documentSets[ownProps.documentSetId].documentIds
    })
)(DocumentList);