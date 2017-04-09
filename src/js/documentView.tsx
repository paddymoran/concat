import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument } from './actions';
import PDFViewer from './pdfViewer';

interface DocumentViewProps {
    params: { documentId: number };
    documents: Array<Sign.Document>;
    removeDocument: Function;
}

interface DocumentViewState {
    updateDocument: Function;
}

class DocumentView extends React.Component<DocumentViewProps, DocumentViewState>  {
    constructor(props: DocumentViewProps) {
        super(props);
    }

    componentWillMount() {
        this.uploadData();
    }

    uploadData() {
        const document = this.props.documents[this.props.params.documentId];

        if (!document.status) {
            // Update file upload progress
            this.state.updateDocument({id: document.id, status: 'posting', progress: 0});

            // Create file reader, read file to BLOB, then call the updateDocument action
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(document.file);
            fileReader.onload = () => {
                this.state.updateDocument({
                    id: document.id,
                    arrayBuffer: fileReader.result,
                    status: 'complete'
                });
            };
        }
    }

    render() {
        const document = this.props.documents[this.props.params.documentId];

        return (
            <div className='pdf-screen'>
                { document.arrayBuffer && <div className='loading' /> }
                { document.arrayBuffer && 
                    <PDFViewer
                        file={ document }
                        data={ document.arrayBuffer }  
                        worker={ false }
                        removeDocument={ () => console.log('return to doc tray') } />
                }
            </div>
        );
    }
}

export default connect(state => ({ documents: state.documents }), { updateDocument: updateDocument })(DocumentView);
