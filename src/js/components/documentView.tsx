import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument, requestDocument } from '../actions';
import PDFViewer from './pdf/viewer';

interface DocumentViewProps {
    params: { documentId: string };
    documents: Sign.Document[];
    removeDocument: Function;
    updateDocument: Function;
    requestDocument: Function;
}

export default class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className='pdf-screen'>
                <PDFViewer documentId={this.props.params.documentId} removeDocument={() => console.log('return to doc tray')} />
            </div>
        );
    }
}

