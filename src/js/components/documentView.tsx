import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument, requestDocument } from '../actions';
import PDFViewer from './pdf/viewer';
import PDFPage from './pdf/page';
import Signature from './signature';
import SignatureDragContainer from './signatureDragContainer';

interface DocumentViewProps {
    params: { documentId: string };
    documents: Sign.Document[];
    removeDocument: Function;
    updateDocument: Function;
    requestDocument: Function;
    signatures: Sign.DocumentSignature[];
}

export default class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (

                <div className="pdf-screen">

                        <PDFViewer documentId={this.props.params.documentId} removeDocument={() => console.log('return to doc tray')} />

                </div>
        );
    }
}
