import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

interface DocumentViewProps {
    document: Sign.Document;
    removeDocument: Function;
}

interface DocumentListProps {
    documents: Sign.Documents;
    removeDocument: Function;
};

const DocumentView = (props: DocumentViewProps) => (
    <div className="document">
        <button className="remove" onClick={() => props.removeDocument()}>✖</button>
        
        <div className="image">{ props.document.uuid && <img src={`/api/documents/thumb/${props.document.uuid}`} /> }</div>
        <div className="filename">{ props.document.filename }</div>
        
        <ReactCSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={500}>
            <div className="progress" key="progress">
                    <div className="progress-bar progress-bar-striped active" style={{width: `${props.document.progress*100}%`}}></div>
                </div>
            { props.document.status === Sign.DocumentUploadStatus.InProgress &&
                <div className="progress" key="progress">
                    <div className="progress-bar progress-bar-striped active" style={{width: `${props.document.progress*100}%`}}></div>
                </div>
            }
        </ReactCSSTransitionGroup>
    </div>
);

const DocumentList = (props: DocumentListProps) => (
    <div className="document-list clearfix">
        { props.documents.filelist.map((document: Sign.Document) => 
            <DocumentView
                document={document}
                key={document.id}
                removeDocument={() => props.removeDocument(document.id)} />
        )}
    </div>
);

export default DocumentList;