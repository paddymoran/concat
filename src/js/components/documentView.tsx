import * as React from 'react';
import PDFViewer from './pdf/viewer';

interface DocumentViewProps {
    params: {
        documentSetId: string;
        documentId: string;
    };
}

export default class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} />
            </div>
        );
    }
}
