import * as React from "react";
import { connect } from 'react-redux';
import DragContextDocumentHandler from './dragContextDocumentHandler';

interface DocumentTrayProps {
    documents: Sign.Documents;
    form: any;
    updateDocument: Function;
    removeDocument: Function;
}

class DocumentTray extends React.Component<DocumentTrayProps, {}> {
    componentWillMount() {
        // Call action to load documents
    }

    render() {
        return (
            <div className='container'>
                <DragContextDocumentHandler  />

                <h2>Documents</h2>

                {this.props.documents.filelist.length === 0 && <p>No documents uploaded yet.</p>}
                {this.props.documents.filelist.length > 0 &&
                    <ul className='list-group'>
                        {this.props.documents.filelist.map((file, index) => <li key={index} className='list-group-item'>{file.filename}</li>)}
                    </ul>
                }
            </div>
        );
    }
}

export default connect(state => ({ documents: state.documents }))(DocumentTray);