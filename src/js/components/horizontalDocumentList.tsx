import * as React from 'react';
import * as ReactDOM from "react-dom";
import { CSSTransitionGroup } from 'react-transition-group';
import PDFPage from './pdf/page';
import { connect } from 'react-redux';
import { reorderDocuments } from '../actions';
import { Link } from 'react-router';
import { findSetForDocument } from '../utils';
import { DragSource, DropTarget } from 'react-dnd';
import { Col, Button } from 'react-bootstrap';

interface ConnectedDocumentViewProps {
    documentId: string;
}

interface DocumentViewProps extends ConnectedDocumentViewProps {
    document: Sign.Document;
    documentSetId: string;
}

interface ConnectedDocumentListProps {
    documentSetId: string;
}

interface DocumentListProps {
    documentIds: string[];
};

const THUMBNAIL_WIDTH = 150;


class DocumentView extends React.PureComponent<DocumentViewProps> {
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
                    <Link to={`/documents/${this.props.documentSetId}/${this.props.documentId}`} className="btn btn-default btn-block">Sign</Link>
                    <a target="_blank" href={`/api/document/${this.props.documentId}`} className="btn btn-default btn-block">Download</a>
                </Col>
            </div>
        );
    }
}

const ConnectedDocumentView = connect(
    (state: Sign.State, ownProps: ConnectedDocumentViewProps) => ({
        document: state.documents[ownProps.documentId],
        documentSetId: findSetForDocument(state.documentSets, ownProps.documentId)
    })
)(DocumentView);

class DocumentList extends React.Component<DocumentListProps> {
    render() {
        return (
            <div className="document-set">
                {this.props.documentIds.map(documentId => <ConnectedDocumentView key={documentId} documentId={documentId} />)}
            </div>
        );
    }
}

export default connect(
    (state: Sign.State, ownProps: ConnectedDocumentListProps) => ({
        documentIds: state.documentSets[ownProps.documentSetId].documentIds
    })
)(DocumentList);