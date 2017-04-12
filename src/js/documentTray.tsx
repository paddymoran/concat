import * as React from "react";
import { connect } from 'react-redux';
import DragContextDocumentHandler from './dragContextDocumentHandler';
import { Glyphicon } from 'react-bootstrap';
import { removeDocument } from './actions';
import DocumentList from './documentList';

interface DocumentTrayProps {
    documents: Sign.Documents;
    form: any;
    updateDocument: Function;
    removeDocument: Function;
}

class DocumentTray extends React.Component<DocumentTrayProps, {}> {
    render() {
        return (
            <div className='container'>
                <h1 className="title">Upload Documents</h1>
                <div className="sub-title">Step 2</div>

                <DragContextDocumentHandler  />

                <h2>Documents</h2>

                <DocumentList documents={this.props.documents} removeDocument={removeDocument} />

                <div className="text-center">
                    <button className={'btn btn-primary btn-lg' + (this.props.documents.filelist.length === 0 ? ' disabled' : '')}>Sign Documents</button>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    documents: state.documents
}), {
    removeDocument: (fileId: number) => removeDocument({ id: fileId })
})(DocumentTray);