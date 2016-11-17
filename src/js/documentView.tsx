import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument } from './actions';
import PDFViewer from './pdfViewer';
import { Document } from './definitions';

interface DocumentViewProps {
    params: Params;
    updateDocument: Function;
}

interface DocumentViewState {
    documents: Array<Document>;
}

class DocumentView extends React.Component<DocumentViewProps, DocumentViewState>  {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.uploadData();
    }

    uploadData() {
        if (!this.state.document.status) {
            // Update file upload progress
            this.state.updateDocument({id: this.state.document.id, status: 'posting', progress: 0});

            // Create file reader, read file to BLOB, then call the updateDocument action
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(this.state.document.file);
            fileReader.onload = () => {
                this.state.updateDocument({
                    id: this.state.document.id,
                    arrayBuffer: fileReader.result,
                    status: 'complete'
                });
            };
        }
    }

    render() {
        const document = this.state.documents[this.props.params.documentId];

        return (
            <div className='pdf-screen'>
                { document.arrayBuffer &&  
                    <div className='loading' />
                }
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

export default connect(state => ({
    documents: state.documents
}), {
    updateDocument: updateDocument
})(DocumentView);
