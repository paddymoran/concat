import * as React from 'react';
import PDFViewer from './pdf/viewer';

interface DocumentViewProps {
    params: { documentId: string };
    documents: Sign.Document[];
    removeDocument: Function;
    updateDocument: Function;
    requestDocument: Function;
    signatures: Sign.DocumentSignatures;
}

export default class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} />
            </div>
        );
    }
}
