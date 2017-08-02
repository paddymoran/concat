import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument, requestDocument } from '../actions';
import PDFViewer from './pdf/viewer';
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

class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className="container">
                <div className="pdf-screen">
                    <SignatureDragContainer signatures={this.props.signatures} className="pdf-page-wrapper">
                        <PDFViewer documentId={this.props.params.documentId} removeDocument={() => console.log('return to doc tray')} />
                    </SignatureDragContainer>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: Sign.State) => ({ signatures: state.documentViewer.signatures })
)(DocumentView);