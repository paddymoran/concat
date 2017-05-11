import * as React from 'react';
import * as Promise from 'bluebird';
import { connect } from 'react-redux';

interface PDFDocumentDictionary {
    [key: string]: PDFDocumentProxy;
}

interface DocumentRendererProps {
    documentSet: Sign.DocumentSet;
    children: any;
}

interface DocumentRendererState {
    pdfs: PDFDocumentDictionary;
}

const PDFS = {};

class DocumentRenderer extends React.Component<DocumentRendererProps, DocumentRendererState> {
    constructor(props: DocumentRendererProps) {
        super(props);

        this.state = {
            pdfs: PDFS
        };

        this.getPDF = this.getPDF.bind(this);
    }

    getPDF(id: string) : Promise<any> {
        // See if PDF already exists, otherwise create it
        if (this.state.pdfs[id]) {
            return Promise.resolve(this.state.pdfs[id]);
        }
        else {
            // Find the document
            const doc = this.props.documentSet.documents.find(doc => doc.id === id);
            
            // Check the document has finished uploading
            if (doc.uploadStatus === Sign.DocumentUploadStatus.Complete) {
                console.log('Upload completed, data below.');
                console.log(doc.data);
                
                // Create the PDF
                const docData = new Uint8Array(doc.data);

                return new Promise((resolve, reject) => {
                    PDFJS.getDocument(docData)
                    .then((pdf: PDFDocumentProxy) => {
                        // Store the PDF in state
                        const pdfs = { ...this.state.pdfs, id: pdf };
                        this.setState({ pdfs });

                        // Resolve on the PDF
                        return resolve(pdf);
                    });
                });
                
            }
            // Document hasn't finished uploading
            else {
                console.log('upload not finished');
                return Promise.reject('PDF upload not complete');
            }
        }
    }

    render() {
        return React.cloneElement(this.props.children, { getPDF: this.getPDF });  // Add getPDF to props of children
    }
}

export default connect((state) => ({
    documentSet: state.documentSet
}))(DocumentRenderer);