import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { removeDocument } from './actions';

interface DocumentViewProps {
    document: Sign.Document;
    removeDocument: Function;
}


interface DocumentListProps {
    documents: Sign.Documents;
    removeDocument: Function;
};

class DocumentView extends React.Component<DocumentViewProps, {}>  {
    render() {
        return (
            <div className="document">
                <button className="remove" onClick={() => this.props.removeDocument()}>✖</button>
                
                <div className="image">
                    {/*{ this.props.document.uuid && <img src={`/thumb/${this.props.document.uuid}`} /> }*/}
                </div>
                
                <div className="filename">
                    { this.props.document.filename }
                </div>
                
                <ReactCSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={500}>
                    { this.props.document.status === Sign.DocumentUploadStatus.InProgress &&
                        <div className="progress" key="progress">
                            <div className="progress-bar progress-bar-striped active" style={{width: `${this.props.document.progress*100}%`}}></div>
                        </div>
                    }
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

export default class DocumentList extends React.Component<DocumentListProps, {}> {
    render() {
         return (
            <div className="document-list clearfix">
                { this.props.documents.filelist.length === 0 && <p>No documents uploaded yet.</p> }
                { this.props.documents.filelist.map(document => <DocumentView document={document} key={document.id} removeDocument={() => this.props.removeDocument(document.id)} /> )}
            </div>
         );
    }
}