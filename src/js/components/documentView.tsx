import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument } from '../actions';
import PDFViewer from './pdf/viewer';

interface DocumentViewProps {
    params: { documentId: string };
    documents: Sign.Document[];
    removeDocument: Function;
    updateDocument: Function;
}

class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className='pdf-screen'>
                <PDFViewer docId={this.props.params.documentId} worker={false} removeDocument={() => console.log('return to doc tray')} />
            </div>
        );
    }
}

export default connect(undefined, { updateDocument: updateDocument })(DocumentView);
