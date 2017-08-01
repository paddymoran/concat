import * as React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import PDFPage from './pdf/page';

interface DocumentViewProps {
    document: Sign.Document;
    removeDocument: Function;
}

interface DocumentListProps {
    documents: Sign.Document[];
    removeDocument: Function;
};

const A4_RATIO = 1.414;

const THUMBNAIL_WIDTH = 150;
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * A4_RATIO;

const DocumentView = (props: DocumentViewProps) => (
    <div className="document">
        <button className="remove" onClick={() => props.removeDocument()}>✖</button>

        <PDFPage pageNumber={0} drawWidth={THUMBNAIL_WIDTH} documentId={props.document.id} showLoading={false}/>
        <div className="filename">{ props.document.filename }</div>

        <CSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
            { props.document.uploadStatus === Sign.DocumentUploadStatus.InProgress &&
                <div className="progress" key="progress">
                    <div className="progress-bar progress-bar-striped active" style={{width: `${props.document.progress*100}%`}}></div>
                </div>
            }
        </CSSTransitionGroup>
    </div>
);

export default class DocumentList extends React.Component<DocumentListProps> {
    render() {
        console.log(this.props.documents)
        return (
            <div className="document-list clearfix">
                {this.props.documents.map(doc => <DocumentView key={doc.id} document={doc} removeDocument={() => {this.props.removeDocument(doc.id)}} />)}
            </div>
        );
    }
}