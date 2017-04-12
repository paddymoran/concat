import * as React from "react";
import { connect } from 'react-redux';
import DragContextDocumentHandler from './dragContextDocumentHandler';
import { Glyphicon } from 'react-bootstrap';
import { removeDocument } from './actions';

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

                {this.props.documents.filelist.length === 0 && <p>No documents uploaded yet.</p>}
                {this.props.documents.filelist.length > 0 &&
                    <ul className="list-group">
                        {this.props.documents.filelist.map((file, index) => 
                            <li key={index} className="list-group-item">
                                {file.filename}
                                <button className="list-group-button" onClick={() => this.props.removeDocument({id: file.id})}><Glyphicon glyph="trash" /></button>
                            </li>
                        )}
                    </ul>
                }

                <div className="text-center">
                    <button className={'btn btn-primary btn-lg' + (this.props.documents.filelist.length === 0 ? ' disabled' : '')}>Sign Documents</button>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    documents: state.documents
}), ({
    removeDocument: (fileId: number) => removeDocument({ id: fileId })
}))(DocumentTray);