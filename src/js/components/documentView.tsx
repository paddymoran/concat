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
    signatures: Sign.DocumentSignatures;
}

class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className="container">
                <div className="pdf-screen">
                    {Object.keys(this.props.signatures).map(key => <Signature key={key} signatureIndex={key} />)}

                    {/*<SignatureDragContainer signatureId={signature id here} className="pdf-page-wrapper" ref="signature-container"> TODO: remove */}
                        <PDFViewer documentId={this.props.params.documentId} removeDocument={() => console.log('return to doc tray')} />
                    {/*</SignatureDragContainer>*/}
                </div>
            </div>
        );
    }
}

export default connect(
    (state: Sign.State) => ({ signatures: state.documentViewer.signatures })
)(DocumentView);