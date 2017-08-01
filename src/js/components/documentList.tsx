import * as React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import PDFPage from './pdf/page';
import { connect } from 'react-redux';
import { removeDocument } from '../actions';
import { Link } from 'react-router';

interface PreConnectDocumentViewProps {
    documentId: string;
}

interface DocumentViewProps extends PreConnectDocumentViewProps {
    document: Sign.Document;
    documentSetId: string;
    removeDocument: Function;
}

interface DocumentListProps {
    documentIds: string[];
};

const A4_RATIO = 1.414;

const THUMBNAIL_WIDTH = 150;
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * A4_RATIO;

@connect(
    (state: Sign.State, ownProps: PreConnectDocumentViewProps) => ({
        document: state.documents[ownProps.documentId],
        documentSetId: Object.keys(state.documentSets).find(key => state.documentSets[key].documentIds.includes(ownProps.documentId))
    }),
    { removeDocument }
)
class DocumentView extends React.PureComponent<DocumentViewProps> {
    render() {
        return (
            <div className="document">
                <button className="remove" onClick={() => this.props.removeDocument(this.props.documentId)}>✖</button>

                <PDFPage pageNumber={0} drawWidth={THUMBNAIL_WIDTH} documentId={this.props.documentId} showLoading={false}/>
                <div className="filename">{ this.props.document && this.props.document.filename ? this.props.document.filename : '' }</div>

                <CSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                    { this.props.document && this.props.document.uploadStatus === Sign.DocumentUploadStatus.InProgress &&
                        <div className="progress" key="progress">
                            <div className="progress-bar progress-bar-striped active" style={{width: `${this.props.document.progress*100}%`}}></div>
                        </div>
                    }
                </CSSTransitionGroup>
                <Link to={`/documents/${this.props.documentSetId}/${this.props.documentId}`}>View</Link>
            </div>
        );
    }
}

export default class DocumentList extends React.Component<DocumentListProps> {
    render() {
        return (
            <div className="document-list clearfix">
                {this.props.documentIds.map(documentId => <DocumentView key={documentId} documentId={documentId} />)}
            </div>
        );
    }
}