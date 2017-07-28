import * as React from 'react';
import { connect } from 'react-redux';
import { updateDocument } from '../actions';
import PDFViewer from './pdf/viewer';

interface DocumentViewProps {
    params: { documentId: string };
    documents: Sign.Document[];
    removeDocument: Function;
    getPDF: (pdfUUID: string) => Promise<any>;
    updateDocument: Function;
}

interface DocumentViewState {
    document?: Sign.Document;
}

class DocumentView extends React.Component<DocumentViewProps, DocumentViewState>  {
    constructor(props: DocumentViewProps) {
        super(props);

        this.state = {};
    }

    componentWillMount() {
        this.loadDocument();
        // this.uploadData();
    }

    loadDocument() {
        this.props.getPDF(this.props.params.documentId)
            .then(document => this.setState({ document }));
    }

    // uploadData() {
    //     const document = this.props.getPDF(this.props.params.documentId);

    //     if (!document.uploadStatus) {
    //         // Update file upload progress
    //         this.props.updateDocument({id: document.id, status: 'posting', progress: 0});

    //         // Create file reader, read file to BLOB, then call the updateDocument action
    //         const fileReader = new FileReader();
    //         fileReader.readAsArrayBuffer(document.file);
    //         fileReader.onload = () => {
    //             this.props.updateDocument({
    //                 id: document.id,
    //                 arrayBuffer: fileReader.result,
    //                 status: 'complete'
    //             });
    //         };
    //     }
    // }

    render() {
        if (!this.state.document) {
            return <h1>Loading</h1>;
        }

        const document = this.state.document;

        return (
            <div className='pdf-screen'>
                <PDFViewer pdfDocumentProxy={document} docId={this.props.params.documentId} worker={false} removeDocument={() => console.log('return to doc tray')} />
            </div>
        );
    }
}

export default connect(state => ({ documents: state.documentSet }), { updateDocument: updateDocument })(DocumentView);
