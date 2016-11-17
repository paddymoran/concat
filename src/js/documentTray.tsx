import * as React from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router';
import DragContextDocumentHandlerConnected from './dragContextDocumentHandlerConnected';

interface DocumentTrayProps {
    documents: any;
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
                <DragContextDocumentHandlerConnected  />

                <h2>Documents</h2>
            </div>
        );
    }
}

export default connect(state => ({ documents: state.documents }))(DocumentTray);